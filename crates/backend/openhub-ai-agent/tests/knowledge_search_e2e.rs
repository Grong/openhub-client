//! E2E regression: the `knowledge_search` tool finds content in a base whose
//! directory carries a self-`.gitignore: *` — the exact scenario where ripgrep
//! (hidden-dir skip + gitignore) returned zero. Proves the hard bug is dead.

use std::sync::Arc;

use openhub_agent::knowledge_tools::KnowledgeSearchTool;
use openhub_tools::Tool;
use serde_json::json;

/// `openhub_realtime` does not ship a public no-op broadcaster (its only one is
/// `pub(crate)` in openhub-knowledge's testutil), so define a local one. The
/// `EventBroadcaster` trait is a single `broadcast` method; the emitter never
/// fires during a read-only search, but the service still requires one.
struct NoopBroadcaster;

impl openhub_realtime::EventBroadcaster for NoopBroadcaster {
    fn broadcast(&self, _event: openhub_api_types::WebSocketMessage<serde_json::Value>) {}
}

async fn build_service() -> (Arc<openhub_knowledge::KnowledgeService>, tempfile::TempDir) {
    let db = openhub_db::init_database_memory().await.expect("in-memory db");
    let repo = Arc::new(openhub_db::SqliteKnowledgeRepository::new(db.pool().clone()));
    let tmp = tempfile::tempdir().unwrap();
    let emitter = openhub_knowledge::KnowledgeEventEmitter::new(Arc::new(NoopBroadcaster));
    let svc = Arc::new(openhub_knowledge::KnowledgeService::new(repo, tmp.path(), emitter));
    (svc, tmp)
}

#[tokio::test]
async fn knowledge_search_tool_finds_topic_through_full_stack() {
    let (svc, _tmp) = build_service().await;
    let info = svc.create_base("运维手册", "", None, None).await.unwrap();
    let root = svc.data_dir().join("knowledge").join(&info.id);
    // The self-ignore the mount writes — must NOT blind the search.
    std::fs::write(root.join(".gitignore"), "*\n").unwrap();
    std::fs::write(root.join("rollback.md"), "# 回滚流程\n回滚分三步\n").unwrap();

    let sink: Arc<dyn openhub_agent::knowledge_tools::KnowledgeRetrievalSink> =
        Arc::new(openhub_ai_agent::LiveKnowledgeRetrievalSink { service: svc });
    let tool = KnowledgeSearchTool::new(sink, vec![info.id]);

    let res = tool.execute(json!({"query": "回滚"})).await;
    assert!(!res.is_error, "tool errored: {}", res.content);
    assert!(res.content.contains("rollback.md"), "must surface the doc:\n{}", res.content);
    assert!(res.content.contains("回滚流程"), "must include heading:\n{}", res.content);
}

#[tokio::test]
async fn knowledge_search_tool_reports_no_match_cleanly() {
    let (svc, _tmp) = build_service().await;
    let info = svc.create_base("库", "", None, None).await.unwrap();
    let root = svc.data_dir().join("knowledge").join(&info.id);
    std::fs::write(root.join("a.md"), "# A\nunrelated content\n").unwrap();

    let sink: Arc<dyn openhub_agent::knowledge_tools::KnowledgeRetrievalSink> =
        Arc::new(openhub_ai_agent::LiveKnowledgeRetrievalSink { service: svc });
    let tool = KnowledgeSearchTool::new(sink, vec![info.id]);

    let res = tool.execute(json!({"query": "完全不存在的主题词"})).await;
    assert!(!res.is_error);
    assert!(res.content.contains("No matches"), "{}", res.content);
}
