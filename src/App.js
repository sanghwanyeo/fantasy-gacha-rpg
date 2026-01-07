import React, { useState } from 'react';
import { Sword, Heart, Shield, Zap, Users, Star, Settings } from 'lucide-react';

const FantasyGachaRPG = () => {
  const [gold, setGold] = useState(1000);
  const [gems, setGems] = useState(100);
  const [characters, setCharacters] = useState([
    { id: 1, name: '기사 아서', class: '전사', rarity: 3, level: 1, hp: 100, atk: 25, def: 20, skills: ['강타', '방어태세'] },
    { id: 2, name: '마법사 메를린', class: '마법사', rarity: 4, level: 1, hp: 60, atk: 40, def: 10, skills: ['화염구', '광역마법'] },
  ]);
  const [team, setTeam] = useState({
    frontRow: [1, null, null],
    backRow: [2, null, null]
  });
  const [currentTab, setCurrentTab] = useState('main');
  const [battleLog, setBattleLog] = useState([]);
  const [isBattling, setIsBattling] = useState(false);
  const [battleState, setBattleState] = useState(null);
  const [hitEffects, setHitEffects] = useState([]);
  const [battleResult, setBattleResult] = useState(null);
  const [gachaResult, setGachaResult] = useState(null);
  const [aiSettings, setAiSettings] = useState({
    1: { hpThreshold: 30, prioritySkill: '강타', targetType: '최약', attackType: 'single' },
    2: { hpThreshold: 50, prioritySkill: '화염구', targetType: '최강', attackType: 'single' }
  });

  const gachaPool = [
    { name: '견습 전사', class: '전사', rarity: 2, hp: 80, atk: 20, def: 15, skills: ['베기'] },
    { name: '궁수 로빈', class: '궁수', rarity: 3, hp: 70, atk: 30, def: 12, skills: ['관통샷', '연사'] },
    { name: '사제 엘레나', class: '사제', rarity: 3, hp: 65, atk: 15, def: 15, skills: ['치유', '보호막'] },
    { name: '암살자 섀도우', class: '암살자', rarity: 4, hp: 75, atk: 45, def: 10, skills: ['암습', '독칼'] },
    { name: '성기사 갈라하드', class: '전사', rarity: 5, hp: 120, atk: 30, def: 30, skills: ['성스러운 일격', '신의 가호'] },
    { name: '대마법사 조하르', class: '마법사', rarity: 5, hp: 70, atk: 50, def: 12, skills: ['메테오', '시간 정지'] },
  ];

  const performGacha = () => {
    if (gems < 10) {
      setGachaResult({ success: false, message: '보석이 부족합니다!' });
      return;
    }
    
    const rand = Math.random();
    let selectedChar;
    
    if (rand < 0.03) {
      const fiveStars = gachaPool.filter(c => c.rarity === 5);
      selectedChar = fiveStars[Math.floor(Math.random() * fiveStars.length)];
    } else if (rand < 0.15) {
      selectedChar = gachaPool.find(c => c.rarity === 4);
    } else if (rand < 0.50) {
      const threeStars = gachaPool.filter(c => c.rarity === 3);
      selectedChar = threeStars[Math.floor(Math.random() * threeStars.length)];
    } else {
      selectedChar = gachaPool[0];
    }
    
    const newChar = {
      ...selectedChar,
      id: Date.now(),
      level: 1
    };
    
    setGems(gems - 10);
    setCharacters([...characters, newChar]);
    setGachaResult({ success: true, character: newChar });
    
    setTimeout(() => setGachaResult(null), 3000);
  };

  const addHitEffect = (targetId, targetName, isEnemy = false) => {
    const effect = {
      id: Date.now() + Math.random(),
      targetId: targetId,
      targetName: targetName,
      isEnemy: isEnemy
    };
    setHitEffects(prev => [...prev, effect]);
    
    // 카드 흔들림 효과를 위해 DOM 요소에 클래스 추가
    const cardElement = document.querySelector(`[data-card-id="${targetId}"]`);
    if (cardElement) {
      cardElement.classList.add('shake-animation');
      setTimeout(() => {
        cardElement.classList.remove('shake-animation');
      }, 600);
    }
    
    setTimeout(() => {
      setHitEffects(prev => prev.filter(e => e.id !== effect.id));
    }, 600);
  };

  const startBattle = () => {
    const allTeamMembers = [...team.frontRow, ...team.backRow].filter(id => id !== null);
    if (allTeamMembers.length === 0) {
      alert('팀을 편성해주세요!');
      return;
    }
    
    setIsBattling(true);
    setBattleLog([]);
    setHitEffects([]);
    setBattleResult(null);
    
    const createTeamChar = (id, row, col) => {
      if (!id) return null;
      const char = characters.find(c => c.id === id);
      return {
        ...char,
        currentHp: char.hp + char.level * 10,
        maxHp: char.hp + char.level * 10,
        row: row,
        col: col,
        position: { x: 80 + col * 60, y: 120 + row * 80 }
      };
    };
    
    const teamChars = {
      frontRow: team.frontRow.map((id, idx) => createTeamChar(id, 0, idx)).filter(c => c !== null),
      backRow: team.backRow.map((id, idx) => createTeamChar(id, 1, idx)).filter(c => c !== null)
    };
    
    const enemies = {
      frontRow: [
        { name: '고블린', hp: 50, atk: 15, currentHp: 50, maxHp: 50, row: 0, col: 1, position: { x: 520, y: 140 } },
        { name: '고블린전사', hp: 60, atk: 18, currentHp: 60, maxHp: 60, row: 0, col: 2, position: { x: 520, y: 200 } }
      ],
      backRow: [
        { name: '오크', hp: 80, atk: 20, currentHp: 80, maxHp: 80, row: 1, col: 1, position: { x: 620, y: 170 } }
      ]
    };
    
    setBattleState({
      team: teamChars,
      enemies: enemies,
      turn: 0,
      message: '전투 시작!',
      currentActor: null
    });
    
    let log = ['전투 시작!'];
    let turn = 0;
    let actionQueue = [];
    
    const processNextAction = () => {
      if (actionQueue.length === 0) {
        turn++;
        if (turn > 15) {
          log.push('\n시간 초과! 무승부');
          setBattleLog(log);
          setBattleResult({
            type: 'draw'
          });
          setTimeout(() => {
            setIsBattling(false);
            setBattleState(null);
          }, 5000);
          return;
        }
        
        log.push(`\n--- 턴 ${turn} ---`);
        
        setBattleState(prev => {
          const newTeam = {
            frontRow: [...prev.team.frontRow],
            backRow: [...prev.team.backRow]
          };
          const newEnemies = {
            frontRow: [...prev.enemies.frontRow],
            backRow: [...prev.enemies.backRow]
          };
          
          actionQueue = [];
          
          const allTeamChars = [...newTeam.frontRow, ...newTeam.backRow];
          allTeamChars.forEach(char => {
            if (char.currentHp > 0) {
              actionQueue.push({ type: 'ally', actor: char, team: newTeam, enemies: newEnemies });
            }
          });
          
          const allEnemies = [...newEnemies.frontRow, ...newEnemies.backRow];
          allEnemies.forEach(enemy => {
            if (enemy.currentHp > 0) {
              actionQueue.push({ type: 'enemy', actor: enemy, team: newTeam, enemies: newEnemies });
            }
          });
          
          setTimeout(() => processNextAction(), 1000);
          
          return { team: newTeam, enemies: newEnemies, turn, message: `턴 ${turn} 시작!`, currentActor: null };
        });
        return;
      }
      
      const action = actionQueue.shift();
      
      setBattleState(prev => {
        const newTeam = {
          frontRow: [...prev.team.frontRow],
          backRow: [...prev.team.backRow]
        };
        const newEnemies = {
          frontRow: [...prev.enemies.frontRow],
          backRow: [...prev.enemies.backRow]
        };
        let message = '';
        
        if (action.type === 'ally') {
          const char = action.actor;
          const ai = aiSettings[char.id] || { 
            hpThreshold: 30, 
            prioritySkill: char.skills[0], 
            targetType: '최약',
            attackType: 'single'
          };
          
          const isAreaAttack = ai.prioritySkill.includes('광역') || ai.prioritySkill.includes('메테오');
          
          let targets = [];
          
          if (isAreaAttack) {
            const allEnemies = [...newEnemies.frontRow, ...newEnemies.backRow].filter(e => e.currentHp > 0);
            targets = allEnemies;
          } else {
            const frontEnemies = newEnemies.frontRow.filter(e => e.currentHp > 0);
            if (frontEnemies.length > 0) {
              targets = frontEnemies;
            } else {
              targets = newEnemies.backRow.filter(e => e.currentHp > 0);
            }
          }
          
          if (targets.length === 0) {
            setTimeout(() => processNextAction(), 500);
            return prev;
          }
          
          let target;
          if (ai.targetType === '최약') {
            target = targets.reduce((min, e) => e.currentHp < min.currentHp ? e : min);
          } else {
            target = targets.reduce((max, e) => e.currentHp > max.currentHp ? e : max);
          }
          
          const damage = char.atk + char.level * 2;
          target.currentHp = Math.max(0, target.currentHp - damage);
          
          const targetKey = `enemy_${target.name}_${target.row}_${target.col}`;
          addHitEffect(targetKey, target.name, true);
          
          log.push(`${char.name}(${char.row === 0 ? '전열' : '후열'})이(가) ${target.name}(${target.row === 0 ? '전열' : '후열'})에게 ${ai.prioritySkill} 사용! (${damage} 데미지)`);
          message = `${char.name} ➜ ${target.name}`;
          
          if (target.currentHp <= 0) {
            log.push(`${target.name} 처치!`);
          }
          
          const allAliveEnemies = [...newEnemies.frontRow, ...newEnemies.backRow].filter(e => e.currentHp > 0);
          if (allAliveEnemies.length === 0) {
            log.push('\n승리! 보상: 골드 +200, 보석 +5');
            setGold(gold + 200);
            setGems(gems + 5);
            setBattleLog(log);
            setBattleResult({
              type: 'victory',
              gold: 200,
              gems: 5
            });
            setTimeout(() => {
              setIsBattling(false);
              setBattleState(null);
            }, 5000);
            return { team: newTeam, enemies: newEnemies, turn, message: '승리!', currentActor: char };
          }
          
        } else {
          const enemy = action.actor;
          const frontTeam = newTeam.frontRow.filter(c => c.currentHp > 0);
          const backTeam = newTeam.backRow.filter(c => c.currentHp > 0);
          
          let possibleTargets = frontTeam.length > 0 ? frontTeam : backTeam;
          if (possibleTargets.length === 0) {
            setTimeout(() => processNextAction(), 500);
            return prev;
          }
          
          const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
          target.currentHp = Math.max(0, target.currentHp - enemy.atk);
          
          addHitEffect(target.id, target.name, false);
          
          log.push(`${enemy.name}(${enemy.row === 0 ? '전열' : '후열'})이(가) ${target.name}(${target.row === 0 ? '전열' : '후열'})을(를) 공격! (${enemy.atk} 데미지)`);
          message = `${enemy.name} ➜ ${target.name}`;
          
          if (target.currentHp <= 0) {
            log.push(`${target.name} 전투불능!`);
          }
          
          const allAliveTeam = [...newTeam.frontRow, ...newTeam.backRow].filter(c => c.currentHp > 0);
          if (allAliveTeam.length === 0) {
            log.push('\n패배...');
            setBattleLog(log);
            setBattleResult({
              type: 'defeat'
            });
            setTimeout(() => {
              setIsBattling(false);
              setBattleState(null);
            }, 5000);
            return { team: newTeam, enemies: newEnemies, turn, message: '패배...', currentActor: enemy };
          }
        }
        
        setBattleLog([...log]);
        setTimeout(() => processNextAction(), 800);
        
        return { team: newTeam, enemies: newEnemies, turn, message, currentActor: action.actor };
      });
    };
    
    setTimeout(() => processNextAction(), 1500);
  };

  const setTeamPosition = (row, col, charId) => {
    setTeam(prev => {
      const newTeam = { ...prev };
      
      newTeam.frontRow = newTeam.frontRow.map(id => id === charId ? null : id);
      newTeam.backRow = newTeam.backRow.map(id => id === charId ? null : id);
      
      if (row === 'front') {
        newTeam.frontRow[col] = charId;
      } else {
        newTeam.backRow[col] = charId;
      }
      
      return newTeam;
    });
  };

  const removeFromTeam = (charId) => {
    setTeam(prev => ({
      frontRow: prev.frontRow.map(id => id === charId ? null : id),
      backRow: prev.backRow.map(id => id === charId ? null : id)
    }));
  };

  const updateAiSetting = (charId, setting, value) => {
    setAiSettings({
      ...aiSettings,
      [charId]: {
        ...aiSettings[charId],
        [setting]: value
      }
    });
  };

  const getRarityColor = (rarity) => {
    const colors = {
      2: 'text-gray-400',
      3: 'text-green-500',
      4: 'text-purple-500',
      5: 'text-yellow-500'
    };
    return colors[rarity] || 'text-gray-400';
  };

  const getCharIcon = (charClass) => {
    const icons = {
      '전사': '⚔️',
      '마법사': '🔮',
      '궁수': '🏹',
      '사제': '✨',
      '암살자': '🗡️'
    };
    return icons[charClass] || '⚔️';
  };

  const getAllTeamMembers = () => {
    return [...team.frontRow, ...team.backRow].filter(id => id !== null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10% { transform: translateX(-8px) rotate(-2deg); }
          20% { transform: translateX(8px) rotate(2deg); }
          30% { transform: translateX(-8px) rotate(-2deg); }
          40% { transform: translateX(8px) rotate(2deg); }
          50% { transform: translateX(-6px) rotate(-1deg); }
          60% { transform: translateX(6px) rotate(1deg); }
          70% { transform: translateX(-4px) rotate(-0.5deg); }
          80% { transform: translateX(4px) rotate(0.5deg); }
          90% { transform: translateX(-2px) rotate(0deg); }
        }
        .shake-animation {
          animation: shake 0.6s ease-in-out !important;
          transform-origin: center center !important;
        }
      `}</style>
      <div className="max-w-6xl mx-auto">
        <div className="bg-black bg-opacity-40 rounded-lg p-4 mb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-yellow-300">판타지 RPG</h1>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-yellow-600 px-4 py-2 rounded">
              <Star size={20} />
              <span className="font-bold">{gold}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded">
              <Zap size={20} />
              <span className="font-bold">{gems}</span>
            </div>
          </div>
        </div>

        {gachaResult && (
          <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-6 rounded-lg ${
            gachaResult.success ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-red-600'
          } shadow-2xl`}>
            {gachaResult.success ? (
              <div className="text-center">
                <div className={`text-6xl mb-4 ${getRarityColor(gachaResult.character.rarity)}`}>
                  {'⭐'.repeat(gachaResult.character.rarity)}
                </div>
                <h2 className="text-3xl font-bold mb-2">{gachaResult.character.name}</h2>
                <p className="text-xl">{gachaResult.character.class}</p>
              </div>
            ) : (
              <p className="text-xl font-bold">{gachaResult.message}</p>
            )}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button onClick={() => setCurrentTab('main')} className={`px-6 py-3 rounded-t-lg font-bold ${currentTab === 'main' ? 'bg-blue-600' : 'bg-gray-700'}`}>메인</button>
          <button onClick={() => setCurrentTab('characters')} className={`px-6 py-3 rounded-t-lg font-bold ${currentTab === 'characters' ? 'bg-blue-600' : 'bg-gray-700'}`}>캐릭터</button>
          <button onClick={() => setCurrentTab('team')} className={`px-6 py-3 rounded-t-lg font-bold ${currentTab === 'team' ? 'bg-blue-600' : 'bg-gray-700'}`}>팀 편성</button>
          <button onClick={() => setCurrentTab('ai')} className={`px-6 py-3 rounded-t-lg font-bold ${currentTab === 'ai' ? 'bg-blue-600' : 'bg-gray-700'}`}>AI 설정</button>
          <button onClick={() => setCurrentTab('battle')} className={`px-6 py-3 rounded-t-lg font-bold ${currentTab === 'battle' ? 'bg-blue-600' : 'bg-gray-700'}`}>전투</button>
        </div>

        {currentTab === 'main' && (
          <div className="bg-black bg-opacity-40 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">소환의 제단</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-lg">
                <Star size={80} className="text-yellow-300" />
              </div>
              <button onClick={performGacha} className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 rounded-lg font-bold text-xl hover:scale-105 transition active:scale-95">
                소환하기 (보석 10개)
              </button>
              <p className="text-sm text-gray-300">5⭐ 확률: 3% | 4⭐ 확률: 12% | 3⭐ 확률: 35%</p>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">현재 보유: {characters.length}명</p>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'characters' && (
          <div className="bg-black bg-opacity-40 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">보유 캐릭터 ({characters.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {characters.map(char => (
                <div key={char.id} className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border-2 border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">{char.name}</h3>
                    <span className={`font-bold ${getRarityColor(char.rarity)}`}>
                      {'⭐'.repeat(char.rarity)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{char.class} Lv.{char.level}</p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Heart size={12} /> HP</span>
                      <span>{char.hp + char.level * 10}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Sword size={12} /> 공격</span>
                      <span>{char.atk + char.level * 2}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Shield size={12} /> 방어</span>
                      <span>{char.def + char.level}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <p className="text-gray-400">스킬: {char.skills.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'team' && (
          <div className="bg-black bg-opacity-40 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">팀 편성 (전열/후열)</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Shield size={20} className="text-red-500" />
                전열 (3자리)
              </h3>
              <div className="flex gap-2">
                {[0, 1, 2].map(col => {
                  const charId = team.frontRow[col];
                  const char = charId ? characters.find(c => c.id === charId) : null;
                  return (
                    <div key={col} className="bg-red-900 bg-opacity-30 border-2 border-red-600 p-4 rounded-lg flex-1 min-h-28 flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-50"
                      onClick={() => { if (char) removeFromTeam(charId); }}>
                      {char ? (
                        <>
                          <div className="text-3xl mb-1">{getCharIcon(char.class)}</div>
                          <p className="font-bold text-sm text-center">{char.name}</p>
                          <p className="text-xs text-gray-400">{char.class}</p>
                        </>
                      ) : (
                        <p className="text-gray-500 text-sm">빈 슬롯</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Zap size={20} className="text-blue-500" />
                후열 (3자리)
              </h3>
              <div className="flex gap-2">
                {[0, 1, 2].map(col => {
                  const charId = team.backRow[col];
                  const char = charId ? characters.find(c => c.id === charId) : null;
                  return (
                    <div key={col} className="bg-blue-900 bg-opacity-30 border-2 border-blue-600 p-4 rounded-lg flex-1 min-h-28 flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-50"
                      onClick={() => { if (char) removeFromTeam(charId); }}>
                      {char ? (
                        <>
                          <div className="text-3xl mb-1">{getCharIcon(char.class)}</div>
                          <p className="font-bold text-sm text-center">{char.name}</p>
                          <p className="text-xs text-gray-400">{char.class}</p>
                        </>
                      ) : (
                        <p className="text-gray-500 text-sm">빈 슬롯</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              💡 전열에 캐릭터가 있으면 후열은 일반 공격으로 타겟할 수 없습니다. 범위 공격은 예외!
            </p>

            <h3 className="text-xl font-bold mb-3">캐릭터 선택 (클릭하여 배치)</h3>
            <div className="grid grid-cols-5 gap-2">
              {characters.map(char => {
                const isInTeam = getAllTeamMembers().includes(char.id);
                return (
                  <div key={char.id} className={`bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-lg border-2 ${
                    isInTeam ? 'border-green-500' : 'border-gray-700'
                  }`}>
                    <div className="flex flex-col items-center mb-1">
                      <div className={`text-right mb-1 w-full ${getRarityColor(char.rarity)}`}>
                        <p className="text-xs font-bold leading-none">{'⭐'.repeat(char.rarity)}</p>
                      </div>
                      <div className="text-2xl mb-1">{getCharIcon(char.class)}</div>
                      <h4 className="font-bold text-xs text-center leading-tight mb-0.5">{char.name}</h4>
                      <p className="text-xs text-gray-400 leading-none">{char.class} Lv.{char.level}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 mb-1 text-xs">
                      <div className="bg-black bg-opacity-30 p-0.5 rounded text-center">
                        <p className="text-gray-400 text-xs leading-none">HP</p>
                        <p className="font-bold text-xs leading-none">{char.hp + char.level * 10}</p>
                      </div>
                      <div className="bg-black bg-opacity-30 p-0.5 rounded text-center">
                        <p className="text-gray-400 text-xs leading-none">공격</p>
                        <p className="font-bold text-red-400 text-xs leading-none">{char.atk + char.level * 2}</p>
                      </div>
                      <div className="bg-black bg-opacity-30 p-0.5 rounded text-center">
                        <p className="text-gray-400 text-xs leading-none">방어</p>
                        <p className="font-bold text-blue-400 text-xs leading-none">{char.def + char.level}</p>
                      </div>
                    </div>
                    
                    <div className="mb-1 bg-black bg-opacity-30 p-1 rounded" style={{ minHeight: '36px' }}>
                      <p className="text-xs text-gray-400 mb-0.5 leading-none">스킬:</p>
                      <div className="flex flex-wrap gap-0.5">
                        {char.skills.map((skill, idx) => (
                          <span key={idx} className="text-xs bg-purple-600 bg-opacity-50 px-1 py-0.5 rounded leading-none">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {isInTeam ? (
                      <div className="bg-green-600 px-1 py-1 rounded text-center text-xs font-bold leading-none">
                        ✓ 편성됨
                      </div>
                    ) : (
                      <div className="flex gap-0.5">
                        <button onClick={() => {
                            const emptyCol = team.frontRow.findIndex(id => id === null);
                            if (emptyCol !== -1) setTeamPosition('front', emptyCol, char.id);
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 px-1 py-1 rounded text-xs font-bold transition leading-none">
                          전열
                        </button>
                        <button onClick={() => {
                            const emptyCol = team.backRow.findIndex(id => id === null);
                            if (emptyCol !== -1) setTeamPosition('back', emptyCol, char.id);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 px-1 py-1 rounded text-xs font-bold transition leading-none">
                          후열
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentTab === 'ai' && (
          <div className="bg-black bg-opacity-40 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">AI 전투 전략 설정</h2>
            <div className="space-y-4">
              {getAllTeamMembers().map(charId => {
                const char = characters.find(c => c.id === charId);
                const ai = aiSettings[charId] || { 
                  hpThreshold: 30, 
                  prioritySkill: char?.skills[0], 
                  targetType: '최약',
                  attackType: 'single'
                };
                
                if (!char) return null;
                
                return (
                  <div key={charId} className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <Settings size={20} />
                      {char.name}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">우선 사용 스킬</label>
                        <select value={ai.prioritySkill} onChange={(e) => updateAiSetting(charId, 'prioritySkill', e.target.value)}
                          className="w-full bg-gray-700 p-2 rounded">
                          {char.skills.map(skill => (
                            <option key={skill} value={skill}>{skill}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">타겟 우선순위</label>
                        <select value={ai.targetType} onChange={(e) => updateAiSetting(charId, 'targetType', e.target.value)}
                          className="w-full bg-gray-700 p-2 rounded">
                          <option value="최약">HP가 가장 낮은 적</option>
                          <option value="최강">HP가 가장 높은 적</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          HP 임계값: {ai.hpThreshold}% (방어 행동 전환)
                        </label>
                        <input type="range" min="10" max="80" value={ai.hpThreshold}
                          onChange={(e) => updateAiSetting(charId, 'hpThreshold', parseInt(e.target.value))}
                          className="w-full" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentTab === 'battle' && (
          <div className="bg-black bg-opacity-40 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">던전 전투</h2>
            <button onClick={startBattle} disabled={isBattling}
              className="bg-red-600 px-8 py-4 rounded-lg font-bold text-xl hover:bg-red-700 disabled:bg-gray-600 mb-4">
              {isBattling ? '전투 중...' : '전투 시작'}
            </button>
            
            {battleState && battleState.team && battleState.enemies && (
              <div className="relative bg-gradient-to-b from-indigo-900 to-purple-900 rounded-lg p-4 mb-4 overflow-hidden" style={{ height: '500px' }}>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 px-6 py-2 rounded-lg z-10">
                  <p className="font-bold text-lg">{battleState.message}</p>
                </div>
                
                <div className="absolute top-4 right-4 bg-blue-600 px-4 py-2 rounded-lg">
                  <p className="font-bold">턴 {battleState.turn}</p>
                </div>
                
                <div className="absolute left-4 top-20">
                  <p className="text-xs text-blue-400 font-bold mb-2 text-center">후열</p>
                  <div className="flex flex-col gap-3">
                    {battleState.team.backRow && battleState.team.backRow.map((char) => (
                      <div key={char.id} 
                        data-card-id={char.id}
                        className={`relative bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg p-3 w-28 border-2 ${
                          char.currentHp > 0 ? 'border-blue-500' : 'border-gray-600 opacity-50'
                        } ${battleState.currentActor?.id === char.id ? 'ring-4 ring-yellow-400 scale-105' : ''}`}
                        style={{ overflow: 'visible', transition: 'none' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl">{getCharIcon(char.class)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{char.name}</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                          <div className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(char.currentHp / char.maxHp) * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-center text-gray-300">{Math.max(0, char.currentHp)}/{char.maxHp}</p>
                        
                        {hitEffects.map(effect => {
                          const isMatch = !effect.isEnemy && effect.targetId === char.id;
                          return isMatch ? (
                            <div key={effect.id} className="absolute"
                              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100, pointerEvents: 'none' }}>
                              <div className="text-6xl font-bold animate-bounce" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,0,0.8))' }}>
                                💥
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="absolute left-36 top-20">
                  <p className="text-xs text-red-400 font-bold mb-2 text-center">전열</p>
                  <div className="flex flex-col gap-3">
                    {battleState.team.frontRow && battleState.team.frontRow.map((char) => (
                      <div key={char.id}
                        data-card-id={char.id}
                        className={`relative bg-gradient-to-br from-red-800 to-red-900 rounded-lg p-3 w-28 border-2 ${
                          char.currentHp > 0 ? 'border-red-500' : 'border-gray-600 opacity-50'
                        } ${battleState.currentActor?.id === char.id ? 'ring-4 ring-yellow-400 scale-105' : ''}`}
                        style={{ overflow: 'visible', transition: 'none' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl">{getCharIcon(char.class)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{char.name}</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                          <div className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(char.currentHp / char.maxHp) * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-center text-gray-300">{Math.max(0, char.currentHp)}/{char.maxHp}</p>
                        
                        {hitEffects.map(effect => {
                          const isMatch = !effect.isEnemy && effect.targetId === char.id;
                          return isMatch ? (
                            <div key={effect.id} className="absolute"
                              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100, pointerEvents: 'none' }}>
                              <div className="text-6xl font-bold animate-bounce" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,0,0.8))' }}>
                                💥
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="absolute right-36 top-20">
                  <p className="text-xs text-red-400 font-bold mb-2 text-center">전열</p>
                  <div className="flex flex-col gap-3">
                    {battleState.enemies.frontRow && battleState.enemies.frontRow.map((enemy, idx) => (
                      <div key={idx}
                        data-card-id={`enemy_${enemy.name}_${enemy.row}_${enemy.col}`}
                        className={`relative bg-gradient-to-br from-red-800 to-red-900 rounded-lg p-3 w-28 border-2 ${
                          enemy.currentHp > 0 ? 'border-red-500' : 'border-gray-600 opacity-50'
                        } ${battleState.currentActor?.name === enemy.name && battleState.currentActor?.row === enemy.row ? 'ring-4 ring-yellow-400 scale-105' : ''}`}
                        style={{ overflow: 'visible', transition: 'none' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl">👹</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{enemy.name}</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                          <div className="bg-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-center text-gray-300">{Math.max(0, enemy.currentHp)}/{enemy.maxHp}</p>
                        
                        {hitEffects.map(effect => {
                          const isMatch = effect.isEnemy && effect.targetName === enemy.name && effect.targetId.includes(`${enemy.row}_`);
                          return isMatch ? (
                            <div key={effect.id} className="absolute"
                              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100, pointerEvents: 'none' }}>
                              <div className="text-6xl font-bold animate-bounce" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,0,0.8))' }}>
                                💥
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="absolute right-4 top-20">
                  <p className="text-xs text-purple-400 font-bold mb-2 text-center">후열</p>
                  <div className="flex flex-col gap-3">
                    {battleState.enemies.backRow && battleState.enemies.backRow.map((enemy, idx) => (
                      <div key={idx}
                        data-card-id={`enemy_${enemy.name}_${enemy.row}_${enemy.col}`}
                        className={`relative bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg p-3 w-28 border-2 ${
                          enemy.currentHp > 0 ? 'border-purple-500' : 'border-gray-600 opacity-50'
                        } ${battleState.currentActor?.name === enemy.name && battleState.currentActor?.row === enemy.row ? 'ring-4 ring-yellow-400 scale-105' : ''}`}
                        style={{ overflow: 'visible', transition: 'none' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl">👺</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{enemy.name}</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                          <div className="bg-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-center text-gray-300">{Math.max(0, enemy.currentHp)}/{enemy.maxHp}</p>
                        
                        {hitEffects.map(effect => {
                          const isMatch = effect.isEnemy && effect.targetName === enemy.name && effect.targetId.includes(`${enemy.row}_`);
                          return isMatch ? (
                            <div key={effect.id} className="absolute"
                              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100, pointerEvents: 'none' }}>
                              <div className="text-6xl font-bold animate-bounce" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,0,0.8))' }}>
                                💥
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                {battleResult && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-40">
                    <div className={`${
                      battleResult.type === 'victory' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                      battleResult.type === 'defeat' ? 'bg-gradient-to-br from-red-600 to-red-800' :
                      'bg-gradient-to-br from-gray-600 to-gray-800'
                    } p-8 rounded-2xl shadow-2xl text-center`}>
                      {battleResult.type === 'victory' && (
                        <>
                          <div className="text-6xl mb-4">🎉</div>
                          <h2 className="text-4xl font-bold mb-4">승리!</h2>
                          <div className="bg-black bg-opacity-30 p-4 rounded-lg mb-4">
                            <p className="text-xl font-bold mb-2">보상</p>
                            <div className="flex justify-center gap-4">
                              <div className="flex items-center gap-2">
                                <Star size={24} />
                                <span className="text-2xl font-bold">+{battleResult.gold}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Zap size={24} />
                                <span className="text-2xl font-bold">+{battleResult.gems}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      {battleResult.type === 'defeat' && (
                        <>
                          <div className="text-6xl mb-4">💀</div>
                          <h2 className="text-4xl font-bold mb-4">패배...</h2>
                          <p className="text-lg">다시 도전해보세요!</p>
                        </>
                      )}
                      {battleResult.type === 'draw' && (
                        <>
                          <div className="text-6xl mb-4">⏱️</div>
                          <h2 className="text-4xl font-bold mb-4">무승부</h2>
                          <p className="text-lg">시간 초과!</p>
                        </>
                      )}
                      <button onClick={() => {
                          setIsBattling(false);
                          setBattleState(null);
                          setBattleResult(null);
                        }}
                        className="mt-4 bg-white text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition">
                        확인
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-gray-900 p-4 rounded-lg h-48 overflow-y-auto">
              <h3 className="font-bold mb-2 text-sm text-gray-400">전투 로그</h3>
              <div className="font-mono text-xs">
                {battleLog.map((log, i) => (
                  <div key={i} className="mb-1 text-gray-300">{log}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FantasyGachaRPG;