/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { CharacterProps } from './types';

const Bolt: React.FC<CharacterProps> = ({ mood, activity, size = 150 }) => {
  // mood: 'happy' | 'content' | 'sleepy' | 'worried' | 'excited'
  // activity: 'idle' | 'thinking'
  const sleeping = mood === 'sleepy';
  const thinking = activity === 'thinking';
  return (
    <div className={`openhub-ch openhub-bolt openhub-bolt--${mood} openhub-bolt--${activity}`} style={{ width: size, height: size }}>
      <style>{`
        .openhub-bolt{position:relative;display:inline-block}
        .openhub-bolt svg{display:block;overflow:visible}
        .openhub-bolt *{transform-box:view-box}
        /* float = whole-body hover */
        .openhub-bolt__body{transform-origin:80px 150px;animation:openhub-bolt-float 3.6s ease-in-out infinite}
        .openhub-bolt__shadow{transform-origin:80px 150px;animation:openhub-bolt-shadow 3.6s ease-in-out infinite}
        .openhub-bolt__jet{transform-origin:80px 132px;animation:openhub-bolt-jet 1.5s ease-in-out infinite}
        .openhub-bolt__antBall{transform-origin:80px 26px;animation:openhub-bolt-ant 3.6s ease-in-out infinite}
        .openhub-bolt__armL{transform-origin:44px 96px;animation:openhub-bolt-armL 3.6s ease-in-out infinite}
        .openhub-bolt__armR{transform-origin:116px 96px;animation:openhub-bolt-armR 3.6s ease-in-out infinite}
        .openhub-bolt__eyes{transform-origin:80px 78px;animation:openhub-bolt-glance 6.5s ease-in-out infinite}
        .openhub-bolt__eyeL,.openhub-bolt__eyeR{transform-origin:80px 76px;animation:openhub-bolt-blink 5s ease-in-out infinite}
        .openhub-bolt__face{animation:openhub-bolt-flicker 4.5s ease-in-out infinite}

        @keyframes openhub-bolt-float{0%,100%{transform:translateY(3px)}50%{transform:translateY(-4px)}}
        @keyframes openhub-bolt-shadow{0%,100%{transform:scaleX(.92) scaleY(.92);opacity:.13}50%{transform:scaleX(1.12) scaleY(1.12);opacity:.08}}
        @keyframes openhub-bolt-jet{0%,100%{transform:scaleX(.85) scaleY(.7);opacity:.55}50%{transform:scaleX(1.12) scaleY(1.15);opacity:.95}}
        @keyframes openhub-bolt-ant{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
        @keyframes openhub-bolt-armL{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-6deg)}}
        @keyframes openhub-bolt-armR{0%,100%{transform:rotate(0deg)}50%{transform:rotate(6deg)}}
        @keyframes openhub-bolt-blink{0%,42%,48%,100%{transform:scaleY(1)}45%{transform:scaleY(.08)}}
        @keyframes openhub-bolt-glance{0%,18%,82%,100%{transform:translateX(0)}30%,46%{transform:translateX(-5px)}58%,74%{transform:translateX(5px)}}
        @keyframes openhub-bolt-flicker{0%,100%{opacity:1}50%{opacity:.92}}

        /* happy: small bounce + brighter screen */
        .openhub-bolt--happy .openhub-bolt__body{animation:openhub-bolt-bounce 1.8s ease-in-out infinite}
        @keyframes openhub-bolt-bounce{0%,100%{transform:translateY(2px)}50%{transform:translateY(-6px)}}

        /* excited: big hover + sparkles */
        .openhub-bolt--excited .openhub-bolt__body{animation:openhub-bolt-exfloat 1.4s ease-in-out infinite}
        @keyframes openhub-bolt-exfloat{0%,100%{transform:translateY(4px)}50%{transform:translateY(-12px)}}
        .openhub-bolt--excited .openhub-bolt__shadow{animation:openhub-bolt-exshadow 1.4s ease-in-out infinite}
        @keyframes openhub-bolt-exshadow{0%,100%{transform:scaleX(.86);opacity:.13}50%{transform:scaleX(1.22);opacity:.06}}
        .openhub-bolt__spark{animation:openhub-bolt-spark 1.2s ease-in-out infinite}
        .openhub-bolt__spark--b{animation-delay:.4s}
        .openhub-bolt__spark--c{animation-delay:.8s}
        @keyframes openhub-bolt-spark{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}

        /* sleepy: sink + dim + z */
        .openhub-bolt--sleepy .openhub-bolt__body{animation:openhub-bolt-sink 4.5s ease-in-out infinite}
        @keyframes openhub-bolt-sink{0%,100%{transform:translateY(6px)}50%{transform:translateY(3px)}}
        .openhub-bolt--sleepy .openhub-bolt__face{animation:none;opacity:.62}
        .openhub-bolt--sleepy .openhub-bolt__jet{animation:openhub-bolt-jetlow 3s ease-in-out infinite;opacity:.4}
        @keyframes openhub-bolt-jetlow{0%,100%{transform:scaleY(.5);opacity:.3}50%{transform:scaleY(.7);opacity:.5}}
        .openhub-bolt__z{opacity:0}
        .openhub-bolt--sleepy .openhub-bolt__z{animation:openhub-bolt-z 3s ease-in-out infinite}
        .openhub-bolt--sleepy .openhub-bolt__z--b{animation-delay:1.5s}
        @keyframes openhub-bolt-z{0%{opacity:0;transform:translate(0,0) scale(.6)}30%{opacity:.9}100%{opacity:0;transform:translate(7px,-22px) scale(1.1)}}

        /* worried: antenna droops, sweat slides */
        .openhub-bolt--worried .openhub-bolt__antBall{animation:none;transform:rotate(22deg) translateY(3px)}
        .openhub-bolt__sweat{opacity:0}
        .openhub-bolt--worried .openhub-bolt__sweat{animation:openhub-bolt-sweat 2.8s ease-in-out infinite}
        @keyframes openhub-bolt-sweat{0%{opacity:0;transform:translateY(0) scale(.7)}18%{opacity:.95}80%{opacity:.85}100%{opacity:0;transform:translateY(16px) scale(1)}}

        /* thinking: loading dots + antenna blink */
        .openhub-bolt__dot{opacity:0}
        .openhub-bolt--thinking .openhub-bolt__dot{animation:openhub-bolt-dot 1.4s ease-in-out infinite}
        .openhub-bolt--thinking .openhub-bolt__dot--b{animation-delay:.25s}
        .openhub-bolt--thinking .openhub-bolt__dot--c{animation-delay:.5s}
        @keyframes openhub-bolt-dot{0%,80%,100%{opacity:.18}40%{opacity:1}}
        .openhub-bolt--thinking .openhub-bolt__antBall{animation:openhub-bolt-antblink 1s ease-in-out infinite}
        @keyframes openhub-bolt-antblink{0%,100%{opacity:1}50%{opacity:.45}}
      `}</style>
      <svg viewBox='0 0 160 160' width={size} height={size}>
        <defs>
          <radialGradient id='boltBody' cx='40%' cy='32%' r='75%'>
            <stop offset='0%' stopColor='#ffffff' />
            <stop offset='55%' stopColor='#f4f7f5' />
            <stop offset='100%' stopColor='#d9e4e0' />
          </radialGradient>
          <radialGradient id='boltScreen' cx='50%' cy='40%' r='70%'>
            <stop offset='0%' stopColor='#28323f' />
            <stop offset='100%' stopColor='#1e2733' />
          </radialGradient>
          <radialGradient id='boltAnt' cx='38%' cy='35%' r='70%'>
            <stop offset='0%' stopColor='#ffd9a0' />
            <stop offset='60%' stopColor='#ffb454' />
            <stop offset='100%' stopColor='#e8902f' />
          </radialGradient>
          <radialGradient id='boltJet' cx='50%' cy='20%' r='80%'>
            <stop offset='0%' stopColor='#d7fff4' stopOpacity='.95' />
            <stop offset='55%' stopColor='#bfeee0' stopOpacity='.6' />
            <stop offset='100%' stopColor='#bfeee0' stopOpacity='0' />
          </radialGradient>
          <radialGradient id='boltBlush' cx='50%' cy='50%' r='50%'>
            <stop offset='0%' stopColor='#ff9ab0' stopOpacity='.55' />
            <stop offset='100%' stopColor='#ff9ab0' stopOpacity='0' />
          </radialGradient>
          <filter id='boltGlow' x='-60%' y='-60%' width='220%' height='220%'>
            <feGaussianBlur stdDeviation='1.6' result='b' />
            <feMerge>
              <feMergeNode in='b' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>

        {/* ground shadow */}
        <ellipse className='openhub-bolt__shadow' cx='80' cy='150' rx='34' ry='7' fill='#000000' opacity='.12' />

        <g className='openhub-bolt__body'>
          {/* hover jet glow */}
          <ellipse className='openhub-bolt__jet' cx='80' cy='132' rx='26' ry='12' fill='url(#boltJet)' />
          <ellipse cx='80' cy='128' rx='17' ry='5' fill='#eafdf7' opacity='.55' />

          {/* antenna */}
          <path d='M80 44 Q78 32 80 24' fill='none' stroke='#c3d2cd' strokeWidth='3' strokeLinecap='round' />
          <g className='openhub-bolt__antBall'>
            <circle cx='80' cy='22' r='7' fill='url(#boltAnt)' stroke='#d98724' strokeWidth='2' />
            <circle cx='77.5' cy='19.5' r='2.2' fill='#fff' opacity='.7' />
          </g>

          {/* arms (behind body edges) */}
          <g className='openhub-bolt__armL'>
            <ellipse cx='38' cy='100' rx='9' ry='13' fill='url(#boltBody)' stroke='#b9c9c3' strokeWidth='2.2' />
          </g>
          <g className='openhub-bolt__armR'>
            <ellipse cx='122' cy='100' rx='9' ry='13' fill='url(#boltBody)' stroke='#b9c9c3' strokeWidth='2.2' />
          </g>

          {/* main body */}
          <path
            d='M80 40
               C112 40 130 62 130 92
               C130 120 110 134 80 134
               C50 134 30 120 30 92
               C30 62 48 40 80 40 Z'
            fill='url(#boltBody)'
            stroke='#b9c9c3'
            strokeWidth='2.4'
            strokeLinejoin='round'
          />
          {/* mint collar accent */}
          <path d='M52 120 Q80 132 108 120' fill='none' stroke='#bfeee0' strokeWidth='5' strokeLinecap='round' opacity='.85' />
          {/* body top highlight */}
          <ellipse cx='66' cy='62' rx='20' ry='11' fill='#ffffff' opacity='.55' />

          {/* face screen */}
          <rect x='44' y='58' width='72' height='52' rx='20' fill='url(#boltScreen)' stroke='#141b24' strokeWidth='2.2' />
          <rect x='48' y='62' width='38' height='15' rx='8' fill='#39506a' opacity='.35' />

          {/* blush */}
          <ellipse cx='56' cy='98' rx='8' ry='5' fill='url(#boltBlush)' />
          <ellipse cx='104' cy='98' rx='8' ry='5' fill='url(#boltBlush)' />

          {/* ===== FACE (glowing) ===== */}
          <g className='openhub-bolt__face' filter='url(#boltGlow)'>
            {thinking ? (
              <>
                {/* loading dots */}
                <circle className='openhub-bolt__dot' cx='66' cy='84' r='5' fill='#37e0ff' />
                <circle className='openhub-bolt__dot openhub-bolt__dot--b' cx='80' cy='84' r='5' fill='#37e0ff' />
                <circle className='openhub-bolt__dot openhub-bolt__dot--c' cx='94' cy='84' r='5' fill='#37e0ff' />
              </>
            ) : sleeping ? (
              <>
                {/* lower-arc sleepy eyes */}
                <path d='M58 80 Q66 88 74 80' fill='none' stroke='#37e0ff' strokeWidth='3.2' strokeLinecap='round' />
                <path d='M86 80 Q94 88 102 80' fill='none' stroke='#37e0ff' strokeWidth='3.2' strokeLinecap='round' />
                <path d='M72 98 Q80 102 88 98' fill='none' stroke='#37e0ff' strokeWidth='2.6' strokeLinecap='round' />
              </>
            ) : mood === 'excited' ? (
              <>
                {/* star eyes */}
                <path d='M66 74 l2.4 5 5.4.6 -4 3.7 1.1 5.3 -4.9-2.8 -4.9 2.8 1.1-5.3 -4-3.7 5.4-.6 z' fill='#37e0ff' />
                <path d='M94 74 l2.4 5 5.4.6 -4 3.7 1.1 5.3 -4.9-2.8 -4.9 2.8 1.1-5.3 -4-3.7 5.4-.6 z' fill='#37e0ff' />
                {/* open happy mouth */}
                <path d='M70 96 Q80 106 90 96 Q80 100 70 96 Z' fill='#37e0ff' />
              </>
            ) : mood === 'worried' ? (
              <>
                {/* drooping worried brows (八字眉: outer ends low) */}
                <path d='M58 78 L72 74' fill='none' stroke='#37e0ff' strokeWidth='3' strokeLinecap='round' />
                <path d='M102 78 L88 74' fill='none' stroke='#37e0ff' strokeWidth='3' strokeLinecap='round' />
                <circle cx='66' cy='86' r='4.6' fill='#37e0ff' />
                <circle cx='94' cy='86' r='4.6' fill='#37e0ff' />
                {/* frown */}
                <path d='M71 100 Q80 94 89 100' fill='none' stroke='#37e0ff' strokeWidth='2.8' strokeLinecap='round' />
              </>
            ) : mood === 'happy' ? (
              <>
                {/* curved happy eyes */}
                <path d='M58 86 Q66 78 74 86' fill='none' stroke='#37e0ff' strokeWidth='3.4' strokeLinecap='round' />
                <path d='M86 86 Q94 78 102 86' fill='none' stroke='#37e0ff' strokeWidth='3.4' strokeLinecap='round' />
                <path d='M70 96 Q80 104 90 96' fill='none' stroke='#37e0ff' strokeWidth='2.8' strokeLinecap='round' />
              </>
            ) : (
              <g className='openhub-bolt__eyes'>
                {/* content round pixel eyes */}
                <ellipse className='openhub-bolt__eyeL' cx='66' cy='84' rx='5' ry='6.5' fill='#37e0ff' />
                <ellipse className='openhub-bolt__eyeR' cx='94' cy='84' rx='5' ry='6.5' fill='#37e0ff' />
                <circle cx='64' cy='81.5' r='1.6' fill='#d7fbff' />
                <circle cx='92' cy='81.5' r='1.6' fill='#d7fbff' />
                <path d='M73 99 Q80 104 87 99' fill='none' stroke='#37e0ff' strokeWidth='2.6' strokeLinecap='round' />
              </g>
            )}
          </g>

          {/* excited sparkles */}
          {mood === 'excited' && (
            <g fill='#ffe08a'>
              <path className='openhub-bolt__spark' d='M120 56 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6-4 -4-1.6 4-1.6 z' />
              <path className='openhub-bolt__spark openhub-bolt__spark--b' d='M40 60 l1.3 3.2 3.2 1.3 -3.2 1.3 -1.3 3.2 -1.3-3.2 -3.2-1.3 3.2-1.3 z' />
              <path className='openhub-bolt__spark openhub-bolt__spark--c' d='M114 92 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2-3 -3-1.2 3-1.2 z' />
            </g>
          )}

          {/* worried sweat */}
          {mood === 'worried' && <path className='openhub-bolt__sweat' d='M112 64 q4 6 0 9 a4.6 4.6 0 1 1 0-9 z' fill='#7fd4ff' opacity='.85' />}

          {/* sleepy z's */}
          {sleeping && (
            <g fill='none' stroke='#9fb0c4' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round'>
              <path className='openhub-bolt__z' d='M104 50 h8 l-8 9 h8' transform='scale(.8)' transform-origin='108 55' />
              <path className='openhub-bolt__z openhub-bolt__z--b' d='M114 44 h6 l-6 7 h6' />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

export default Bolt;
