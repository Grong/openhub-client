mod claude;
mod cli_helpers;
mod codebuddy;
mod codex;
mod gemini;
mod openhub;
mod opencode;
mod qwen;

pub use claude::ClaudeAdapter;
pub use codebuddy::CodeBuddyAdapter;
pub use codex::CodexAdapter;
pub use gemini::GeminiAdapter;
pub use openhub::OpenhubAdapter;
pub use opencode::OpencodeAdapter;
pub use qwen::QwenAdapter;
