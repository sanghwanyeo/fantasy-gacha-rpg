import React, { useState } from 'react';
import { Sword, Shield, Star, Settings, Gem } from 'lucide-react';

function App() {
  const [gold, setGold] = useState(1000);
  const [gems, setGems] = useState(100);
  const [characters, setCharacters] = useState([
    { id: 1, name: '기사 아서', class: '전사', rarity: 3, level: 1, hp: 100, atk: 25, def: 20, skills: ['강타', '방어태세'], equipment: { weapon: null, armor: null, accessory: null } },
    { id: 2, name: '마법사 메를린', class: '마법사', rarity: 4, level: 1, hp: 60, atk: 40, def: 10, skills: ['화염구', '광역마법'], equipment: { weapon: null, armor: null, accessory: null } }
  ]);
  
  const [team, setTeam] = useState({ frontRow: [1, null, null], backRow: [2, null, null] });
  const [currentTab, setCurrentTab] = useState('battle');
  const [selectedChar, setSelectedChar] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [gachaResult, setGachaResult] = useState(null);
  const [battleState, setBattleState] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [isBattling, setIsBattling] = useState(false);
  const [hitEffects, setHitEffects] = useState([]);
  
  const [inventory, setInventory] = useState({
    weapons: [{ id: 'w1', name: '강철 검', atk: 10, rarity: 2 }, { id: 'w2', name: '마법 지팡이', atk: 15, rarity: 3 }],
    armors: [{ id: 'a1', name: '가죽 갑옷', def: 8, hp: 20, rarity: 2 }, { id: 'a2', name: '마법 로브', def: 5, hp: 15, rarity: 3 }],
    accessories: [{ id: 'ac1', name: '힘의 반지', atk: 5, rarity: 2 }]
  });
  
  const [aiSettings, setAiSettings] = useState({
    1: { prioritySkill: '강타', targetType: '최약' },
    2: { prioritySkill: '화염구', targetType: '최강' }
  });

  const gachaPool = [
    { name: '견습 전사', class: '전사', rarity: 2, hp: 80, atk: 20, def: 15, skills: ['베기'] },
    { name: '궁수 로빈', class: '궁수', rarity: 3, hp: 70, atk: 30, def: 12, skills: ['관통샷', '연사'] },
    { name: '사제 엘레나', class: '사제', rarity: 3, hp: 65, atk: 15, def: 15, skills: ['치유', '보호막'] },
    { name: '암살자 섀도우', class: '암살자', rarity: 4, hp: 75, atk: 45, def: 10, skills: ['암습', '독칼'] },
    { name: '성기사 갈라하드', class: '전사', rarity: 5, hp: 120, atk: 30, def: 30, skills: ['성스러운 일격', '신의 가호'] },
    { name: '대마법사 조하르', class: '마법사', rarity: 5, hp: 70, atk: 50, def: 12, skills: ['메테오', '시간 정지'] }
  ];

  const equipmentGachaPool = {
    weapons: [
      { name: '녹슨 검', atk: 5, rarity: 1 },
      { name: '강철 검', atk: 10, rarity: 2 },
      { name: '은빛 검', atk: 15, rarity: 3 },
      { name: '마법 지팡이', atk: 20, rarity: 3 },
      { name: '불꽃의 검', atk: 25, rarity: 4 },
      { name: '드래곤 슬레이어', atk: 35, rarity: 5 }
    ],
    armors: [
      { name: '천 갑옷', def: 3, hp: 10, rarity: 1 },
      { name: '가죽 갑옷', def: 8, hp: 20, rarity: 2 },
      { name: '마법 로브', def: 10, hp: 25, rarity: 3 },
      { name: '강화 갑옷', def: 15, hp: 35, rarity: 4 },
      { name: '미스릴 아머', def: 25, hp: 60, rarity: 5 }
    ],
    accessories: [
      { name: '돌 반지', atk: 2, rarity: 1 },
      { name: '힘의 반지', atk: 5, rarity: 2 },
      { name: '민첩의 목걸이', def: 5, rarity: 3 },
      { name: '영웅의 벨트', atk: 8, def: 8, rarity: 4 },
      { name: '드래곤의 심장', atk: 15, def: 10, rarity: 5 }
    ]
  };

  const performGacha = () => {
    if (gems < 10) {
      setGachaResult({ success: false, message: '보석이 부족합니다!' });
      setTimeout(() => setGachaResult(null), 2000);
      return;
    }
    
    const rand = Math.random();
    let selected;
    
    if (rand < 0.03) {
      const five = gachaPool.filter(c => c.rarity === 5);
      selected = five[Math.floor(Math.random() * five.length)];
    } else if (rand < 0.15) {
      selected = gachaPool.find(c => c.rarity === 4);
    } else if (rand < 0.50) {
      const three = gachaPool.filter(c => c.rarity === 3);
      selected = three[Math.floor(Math.random() * three.length)];
    } else {
      selected = gachaPool[0];
    }
    
    const newChar = {
      ...selected,
      id: Date.now(),
      level: 1,
      equipment: { weapon: null, armor: null, accessory: null }
    };
    
    setGems(gems - 10);
    setCharacters([...characters, newChar]);
    setGachaResult({ success: true, character: newChar });
    setTimeout(() => setGachaResult(null), 3000);
  };

  const performEquipmentGacha = () => {
    if (gold < 100) {
      setGachaResult({ success: false, message: '골드가 부족합니다!' });
      setTimeout(() => setGachaResult(null), 2000);
      return;
    }
    
    const rand = Math.random();
    let rarity;
    if (rand < 0.01) rarity = 5;
    else if (rand < 0.05) rarity = 4;
    else if (rand < 0.20) rarity = 3;
    else if (rand < 0.50) rarity = 2;
    else rarity = 1;
    
    const typeRand = Math.random();
    let pool, slot, arrayKey;
    
    if (typeRand < 0.4) {
      pool = equipmentGachaPool.weapons;
      slot = 'weapon';
      arrayKey = 'weapons';
    } else if (typeRand < 0.8) {
      pool = equipmentGachaPool.armors;
      slot = 'armor';
      arrayKey = 'armors';
    } else {
      pool = equipmentGachaPool.accessories;
      slot = 'accessory';
      arrayKey = 'accessories';
    }
    
    const items = pool.filter(i => i.rarity === rarity);
    const selected = items[Math.floor(Math.random() * items.length)];
    const newItem = { ...selected, id: `${slot}_${Date.now()}` };
    
    setGold(gold - 100);
    setInventory(prev => ({
      ...prev,
      [arrayKey]: [...prev[arrayKey], newItem]
    }));
    setGachaResult({ success: true, equipment: newItem, equipmentSlot: slot });
    setTimeout(() => setGachaResult(null), 3000);
  };

  const calculateStats = (char) => {
    const eq = char.equipment || {};
    let stats = {
      hp: char.hp + char.level * 10,
      atk: char.atk + char.level * 2,
      def: char.def + char.level
    };
    
    if (eq.weapon) {
      const w = inventory.weapons.find(i => i.id === eq.weapon);
      if (w) stats.atk += w.atk || 0;
    }
    if (eq.armor) {
      const a = inventory.armors.find(i => i.id === eq.armor);
      if (a) {
        stats.def += a.def || 0;
        stats.hp += a.hp || 0;
      }
    }
    if (eq.accessory) {
      const ac = inventory.accessories.find(i => i.id === eq.accessory);
      if (ac) {
        stats.atk += ac.atk || 0;
        stats.def += ac.def || 0;
      }
    }
    return stats;
  };

  const equipItem = (charId, slot, itemId) => {
    setCharacters(prev => prev.map(c =>
      c.id === charId ? { ...c, equipment: { ...c.equipment, [slot]: itemId } } : c
    ));
  };

  const unequipItem = (charId, slot) => {
    setCharacters(prev => prev.map(c =>
      c.id === charId ? { ...c, equipment: { ...c.equipment, [slot]: null } } : c
    ));
  };

  const getItemOwner = (slot, itemId) => {
    return characters.find(c => c.equipment && c.equipment[slot] === itemId);
  };

  const addHitEffect = (targetId, targetName, isEnemy, effectType) => {
    const effect = {
      id: Date.now() + Math.random(),
      targetId,
      targetName,
      isEnemy,
      effectType: effectType || 'physical'
    };
    setHitEffects(prev => [...prev, effect]);
    
    const el = document.querySelector(`[data-card-id="${targetId}"]`);
    if (el) {
      el.classList.add('shake-animation');
      setTimeout(() => el.classList.remove('shake-animation'), 600);
    }
    setTimeout(() => setHitEffects(prev => prev.filter(e => e.id !== effect.id)), 600);
  };

  const startBattle = () => {
    const all = [...team.frontRow, ...team.backRow].filter(id => id !== null);
    if (all.length === 0) {
      alert('팀을 편성해주세요!');
      return;
    }
    
    setIsBattling(true);
    setBattleLog([]);
    setHitEffects([]);
    setBattleResult(null);
    
    const createChar = (id, row, col) => {
      if (!id) return null;
      const chr = characters.find(x => x.id === id);
      if (!chr) return null;
      const s = calculateStats(chr);
      return {
        ...chr,
        currentHp: s.hp,
        maxHp: s.hp,
        atk: s.atk,
        def: s.def,
        row,
        col
      };
    };
    
    const teamChars = {
      frontRow: team.frontRow.map((id, i) => createChar(id, 0, i)).filter(c => c !== null),
      backRow: team.backRow.map((id, i) => createChar(id, 1, i)).filter(c => c !== null)
    };
    
    const enemies = {
      frontRow: [
        { name: '고블린', hp: 50, atk: 15, currentHp: 50, maxHp: 50, row: 0, col: 1 },
        { name: '고블린전사', hp: 60, atk: 18, currentHp: 60, maxHp: 60, row: 0, col: 2 }
      ],
      backRow: [
        { name: '오크', hp: 80, atk: 20, currentHp: 80, maxHp: 80, row: 1, col: 1 }
      ]
    };
    
    setBattleState({
      team: teamChars,
      enemies,
      turn: 0,
      message: '전투 시작!',
      currentActor: null
    });
    
    let log = ['전투 시작!'];
    let turn = 0;
    let queue = [];
    
    const processNext = () => {
      if (queue.length === 0) {
        turn++;
        if (turn > 15) {
          log.push('\n시간 초과! 무승부');
          setBattleLog(log);
          setBattleResult({ type: 'draw' });
          setTimeout(() => {
            setIsBattling(false);
            setBattleState(null);
          }, 5000);
          return;
        }
        
        log.push(`\n--- 턴 ${turn} ---`);
        setBattleState(prev => {
          if (!prev) return null;
          
          const nt = {
            frontRow: [...prev.team.frontRow],
            backRow: [...prev.team.backRow]
          };
          const ne = {
            frontRow: [...prev.enemies.frontRow],
            backRow: [...prev.enemies.backRow]
          };
          
          queue = [];
          [...nt.frontRow, ...nt.backRow].forEach(c => {
            if (c.currentHp > 0) queue.push({ type: 'ally', actor: c });
          });
          [...ne.frontRow, ...ne.backRow].forEach(e => {
            if (e.currentHp > 0) queue.push({ type: 'enemy', actor: e });
          });
          
          setTimeout(() => processNext(), 1000);
          return {
            team: nt,
            enemies: ne,
            turn,
            message: `턴 ${turn} 시작!`,
            currentActor: null
          };
        });
        return;
      }
      
      const action = queue.shift();
      setBattleState(prev => {
        if (!prev) return null;
        
        const nt = {
          frontRow: [...prev.team.frontRow],
          backRow: [...prev.team.backRow]
        };
        const ne = {
          frontRow: [...prev.enemies.frontRow],
          backRow: [...prev.enemies.backRow]
        };
        let msg = '';
        
        if (action.type === 'ally') {
          const c = action.actor;
          if (c.currentHp <= 0) {
            setTimeout(() => processNext(), 500);
            return prev;
          }
          
          const ai = aiSettings[c.id] || {
            prioritySkill: c.skills[0],
            targetType: '최약'
          };
          
          const isArea = ai.prioritySkill.includes('광역') || ai.prioritySkill.includes('메테오');
          
          let targets = [];
          if (isArea) {
            targets = [...ne.frontRow, ...ne.backRow].filter(e => e.currentHp > 0);
          } else {
            const frontEnemies = ne.frontRow.filter(e => e.currentHp > 0);
            targets = frontEnemies.length > 0 ? frontEnemies : ne.backRow.filter(e => e.currentHp > 0);
          }
          
          if (targets.length === 0) {
            setTimeout(() => processNext(), 500);
            return prev;
          }
          
          const target = ai.targetType === '최약'
            ? targets.reduce((min, e) => e.currentHp < min.currentHp ? e : min)
            : targets.reduce((max, e) => e.currentHp > max.currentHp ? e : max);
          
          const damage = c.atk;
          target.currentHp = Math.max(0, target.currentHp - damage);
          
          const isMagic = ai.prioritySkill.includes('마법') ||
                         ai.prioritySkill.includes('화염') ||
                         ai.prioritySkill.includes('메테오') ||
                         ai.prioritySkill.includes('시간');
          
          addHitEffect(
            `enemy_${target.name}_${target.row}_${target.col}`,
            target.name,
            true,
            isMagic ? 'magic' : 'physical'
          );
          
          log.push(`${c.name}이(가) ${target.name}에게 ${ai.prioritySkill} (${damage} 데미지)`);
          msg = `${c.name} ➜ ${target.name}`;
          
          if (target.currentHp <= 0) {
            log.push(`${target.name} 처치!`);
          }
          
          const aliveEnemies = [...ne.frontRow, ...ne.backRow].filter(e => e.currentHp > 0);
          if (aliveEnemies.length === 0) {
            log.push('\n승리! 보상: 골드 +200, 보석 +5');
            setGold(gold + 200);
            setGems(gems + 5);
            setBattleLog(log);
            setBattleResult({ type: 'victory', gold: 200, gems: 5 });
            setTimeout(() => {
              setIsBattling(false);
              setBattleState(null);
            }, 5000);
            return {
              team: nt,
              enemies: ne,
              turn,
              message: '승리!',
              currentActor: c
            };
          }
        } else {
          const e = action.actor;
          if (e.currentHp <= 0) {
            setTimeout(() => processNext(), 500);
            return prev;
          }
          
          const frontTeam = nt.frontRow.filter(c => c.currentHp > 0);
          const backTeam = nt.backRow.filter(c => c.currentHp > 0);
          const possibleTargets = frontTeam.length > 0 ? frontTeam : backTeam;
          
          if (possibleTargets.length === 0) {
            setTimeout(() => processNext(), 500);
            return prev;
          }
          
          const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
          target.currentHp = Math.max(0, target.currentHp - e.atk);
          
          addHitEffect(target.id, target.name, false, 'physical');
          
          log.push(`${e.name}이(가) ${target.name}을(를) 공격! (${e.atk} 데미지)`);
          msg = `${e.name} ➜ ${target.name}`;
          
          if (target.currentHp <= 0) {
            log.push(`${target.name} 전투불능!`);
          }
          
          const aliveTeam = [...nt.frontRow, ...nt.backRow].filter(c => c.currentHp > 0);
          if (aliveTeam.length === 0) {
            log.push('\n패배...');
            setBattleLog(log);
            setBattleResult({ type: 'defeat' });
            setTimeout(() => {
              setIsBattling(false);
              setBattleState(null);
            }, 5000);
            return {
              team: nt,
              enemies: ne,
              turn,
              message: '패배...',
              currentActor: e
            };
          }
        }
        
        setBattleLog([...log]);
        setTimeout(() => processNext(), 800);
        return {
          team: nt,
          enemies: ne,
          turn,
          message: msg,
          currentActor: action.actor
        };
      });
    };
    
    setTimeout(() => processNext(), 1500);
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
      1: 'text-gray-500',
      2: 'text-gray-400',
      3: 'text-green-500',
      4: 'text-purple-500',
      5: 'text-yellow-500'
    };
    return colors[rarity] || 'text-gray-400';
  };
  
  const getCharIcon = (charClass) => {
    const imageMap = {
      '전사': `${process.env.PUBLIC_URL || ''}/image/card_1_final.png`,
      '궁수': `${process.env.PUBLIC_URL || ''}/image/card_2_final.png`,
      '사제': `${process.env.PUBLIC_URL || ''}/image/card_3_final.png`,
      '암살자': `${process.env.PUBLIC_URL || ''}/image/card_4_final.png`,
      '마법사': `${process.env.PUBLIC_URL || ''}/image/card_5_final.png`
    };
    
    const imagePath = imageMap[charClass] || imageMap['전사'];
    
    return (
      <img 
        src={imagePath} 
        alt={charClass}
        className="w-full h-full object-cover rounded"
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        onError={(e) => {
          console.error('이미지 로드 실패:', imagePath);
          e.target.style.display = 'none';
        }}
      />
    );
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
        {/* 헤더 */}
        <div className="bg-black bg-opacity-40 rounded-lg p-4 mb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-yellow-300">판타지 RPG</h1>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-yellow-600 px-4 py-2 rounded">
              <Star size={20}/>
              <span className="font-bold">{gold}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded">
              <Gem size={20}/>
              <span className="font-bold">{gems}</span>
            </div>
          </div>
        </div>

        {/* 가챠 결과 팝업 */}
        {gachaResult && (
          <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-6 rounded-lg shadow-2xl ${
            gachaResult.success ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-red-600'
          }`}>
            {gachaResult.success ? (
              gachaResult.character ? (
                <div className="text-center">
                  <div className={`text-6xl mb-4 ${getRarityColor(gachaResult.character.rarity)}`}>
                    {'⭐'.repeat(gachaResult.character.rarity)}
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{gachaResult.character.name}</h2>
                  <p className="text-xl">{gachaResult.character.class}</p>
                </div>
              ) : gachaResult.equipment ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {gachaResult.equipmentSlot === 'weapon' ? '⚔️' :
                     gachaResult.equipmentSlot === 'armor' ? '🛡️' : '💍'}
                  </div>
                  <div className={`text-4xl mb-2 ${getRarityColor(gachaResult.equipment.rarity)}`}>
                    {'⭐'.repeat(gachaResult.equipment.rarity)}
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{gachaResult.equipment.name}</h2>
                  <div className="text-lg">
                    {gachaResult.equipment.atk && <p className="text-red-400">공격 +{gachaResult.equipment.atk}</p>}
                    {gachaResult.equipment.def && <p className="text-blue-400">방어 +{gachaResult.equipment.def}</p>}
                    {gachaResult.equipment.hp && <p className="text-green-400">HP +{gachaResult.equipment.hp}</p>}
                  </div>
                </div>
              ) : null
            ) : (
              <p className="text-xl font-bold">{gachaResult.message}</p>
            )}
          </div>
        )}

        {/* 확인 모달 */}
        {confirmModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-md">
              <h3 className="text-xl font-bold mb-4">{confirmModal.title}</h3>
              <p className="text-gray-300 mb-6">{confirmModal.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold"
                >
                  확인
                </button>
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-bold"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <button
            onClick={() => { setCurrentTab('battle'); setGachaResult(null); }}
            className={`px-6 py-3 rounded-t-lg font-bold whitespace-nowrap ${
              currentTab === 'battle' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            전투
          </button>
          <button
            onClick={() => { setCurrentTab('characters'); setGachaResult(null); setSelectedChar(null); }}
            className={`px-6 py-3 rounded-t-lg font-bold whitespace-nowrap ${
              currentTab === 'characters' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            캐릭터
          </button>
          <button
            onClick={() => { setCurrentTab('team'); setGachaResult(null); }}
            className={`px-6 py-3 rounded-t-lg font-bold whitespace-nowrap ${
              currentTab === 'team' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            팀 편성
          </button>
          <button
            onClick={() => { setCurrentTab('ai'); setGachaResult(null); }}
            className={`px-6 py-3 rounded-t-lg font-bold whitespace-nowrap ${
              currentTab === 'ai' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            AI 설정
          </button>
          <button
            onClick={() => { setCurrentTab('main'); setGachaResult(null); }}
            className={`px-6 py-3 rounded-t-lg font-bold whitespace-nowrap ${
              currentTab === 'main' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            소환의 제단
          </button>
        </div>

        {/* 메인 화면 */}
        {currentTab === 'main' && (
          <div className="bg-black bg-opacity-40 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">소환의 제단</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-xl font-bold text-purple-300">캐릭터 소환</h3>
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-lg">
                  <Star size={80} className="text-yellow-300"/>
                </div>
                <button
                  onClick={performGacha}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 rounded-lg font-bold text-xl hover:scale-105 transition w-full"
                >
                  소환하기 (보석 10개)
                </button>
                <p className="text-sm text-gray-300">5⭐: 3% | 4⭐: 12% | 3⭐: 35%</p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-xl font-bold text-yellow-300">장비 소환</h3>
                <div className="bg-gradient-to-br from-yellow-600 to-orange-600 p-8 rounded-lg">
                  <Sword size={80} className="text-white"/>
                </div>
                <button
                  onClick={performEquipmentGacha}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 px-8 py-4 rounded-lg font-bold text-xl hover:scale-105 transition w-full"
                >
                  소환하기 (골드 100개)
                </button>
                <p className="text-sm text-gray-300">5⭐: 1% | 4⭐: 4% | 3⭐: 15%</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">
              보유: {characters.length}명 | {inventory.weapons.length + inventory.armors.length + inventory.accessories.length}개 장비
            </p>
          </div>
        )}

        {/* 캐릭터 화면 */}
        {currentTab === 'characters' && (
          <div className="bg-black bg-opacity-40 rounded-lg p-6">
            {!selectedChar ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">보유 캐릭터 ({characters.length})</h2>
                <div className="grid grid-cols-5 gap-2">
                  {characters.map(char => {
                    const s = calculateStats(char);
                    const eq = char.equipment || {};
                    return (
                      <button
                        key={char.id}
                        onClick={() => setSelectedChar(char.id)}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-lg border-2 border-gray-700 hover:border-blue-500 text-left"
                      >
                        <div className="flex gap-2">
                          {/* 왼쪽: 이미지 */}
                          <div className="w-16 flex-shrink-0 flex flex-col">
                            <div className={`${getRarityColor(char.rarity)} mb-1`}>
                              <p className="text-xs font-bold text-center">{'⭐'.repeat(char.rarity)}</p>
                            </div>
                            {getCharIcon(char.class)}
                          </div>
                          
                          {/* 오른쪽: 정보 */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div>
                              <h4 className="font-bold text-xs truncate">{char.name}</h4>
                              <p className="text-xs text-gray-400">{char.class} Lv.{char.level}</p>
                            </div>
                            
                            {/* 스탯 - 한 줄 */}
                            <div className="bg-black bg-opacity-40 px-1.5 py-1 rounded flex justify-between text-xs">
                              <span>HP {s.hp}</span>
                              <span className="text-red-400">공 {s.atk}</span>
                              <span className="text-blue-400">방 {s.def}</span>
                            </div>
                            
                            {/* 스킬 - 세로 */}
                            <div className="bg-black bg-opacity-40 p-1 rounded">
                              <p className="text-xs text-gray-400 mb-0.5">스킬:</p>
                              {char.skills.map((sk, i) => (
                                <p key={i} className="text-xs bg-purple-600 bg-opacity-50 px-1 py-0.5 rounded mb-0.5 truncate">
                                  {sk}
                                </p>
                              ))}
                            </div>
                            
                            {/* 장비 - 세로 */}
                            <div className="bg-black bg-opacity-40 p-1 rounded text-xs">
                              <p className="text-gray-400 mb-0.5">장비:</p>
                              {eq.weapon ? (
                                <p className="text-yellow-400 truncate">
                                  ⚔️{inventory.weapons.find(w => w.id === eq.weapon)?.name}
                                </p>
                              ) : (
                                <p className="text-gray-600">⚔️없음</p>
                              )}
                              {eq.armor ? (
                                <p className="text-blue-400 truncate">
                                  🛡️{inventory.armors.find(a => a.id === eq.armor)?.name}
                                </p>
                              ) : (
                                <p className="text-gray-600">🛡️없음</p>
                              )}
                              {eq.accessory ? (
                                <p className="text-purple-400 truncate">
                                  💍{inventory.accessories.find(ac => ac.id === eq.accessory)?.name}
                                </p>
                              ) : (
                                <p className="text-gray-600">💍없음</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setSelectedChar(null)}
                  className="mb-4 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                >
                  ← 뒤로
                </button>
                {(() => {
                  const c = characters.find(x => x.id === selectedChar);
                  if (!c) return null;
                  const s = calculateStats(c);
                  
                  return (
                    <div>
                      <div className="bg-gray-800 p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="w-16 h-16 overflow-hidden rounded flex-shrink-0">{getCharIcon(c.class)}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold">{c.name}</h3>
                            <p className="text-sm text-gray-400">{c.class} Lv.{c.level}</p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <div className="bg-black bg-opacity-30 p-2 rounded text-center">
                              <p className="text-gray-400 text-xs">HP</p>
                              <p className="font-bold text-green-400">{s.hp}</p>
                            </div>
                            <div className="bg-black bg-opacity-30 p-2 rounded text-center">
                              <p className="text-gray-400 text-xs">공격</p>
                              <p className="font-bold text-red-400">{s.atk}</p>
                            </div>
                            <div className="bg-black bg-opacity-30 p-2 rounded text-center">
                              <p className="text-gray-400 text-xs">방어</p>
                              <p className="font-bold text-blue-400">{s.def}</p>
                            </div>
                            <div className="bg-black bg-opacity-30 p-2 rounded">
                              <p className="text-gray-400 text-xs mb-1">스킬</p>
                              <div className="flex flex-wrap gap-1">
                                {c.skills.map((sk, i) => (
                                  <span key={i} className="text-xs bg-purple-600 bg-opacity-50 px-1.5 py-0.5 rounded">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {/* 무기 */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold">⚔️ 무기</h4>
                            {c.equipment.weapon && (
                              <button
                                onClick={() => unequipItem(c.id, 'weapon')}
                                className="text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                              >
                                해제
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {inventory.weapons.map(w => {
                              const isEq = c.equipment.weapon === w.id;
                              const owner = getItemOwner('weapon', w.id);
                              const isOther = owner && owner.id !== c.id;
                              
                              return (
                                <button
                                  key={w.id}
                                  onClick={() => {
                                    if (isEq) {
                                      unequipItem(c.id, 'weapon');
                                    } else if (isOther) {
                                      setConfirmModal({
                                        title: '장비 착용 확인',
                                        message: `${owner.name}이(가) ${w.name}을(를) 착용 중입니다. 해제하고 ${c.name}에게 장착하시겠습니까?`,
                                        onConfirm: () => {
                                          unequipItem(owner.id, 'weapon');
                                          equipItem(c.id, 'weapon', w.id);
                                        }
                                      });
                                    } else {
                                      equipItem(c.id, 'weapon', w.id);
                                    }
                                  }}
                                  className={`p-2 rounded-lg border-2 transition ${
                                    isEq ? 'bg-green-700 border-green-500' :
                                    isOther ? 'bg-orange-700 border-orange-500' :
                                    'bg-gray-800 border-gray-700 hover:border-gray-500'
                                  }`}
                                >
                                  <div className={`text-xs font-bold mb-1 ${getRarityColor(w.rarity)}`}>
                                    {'⭐'.repeat(w.rarity)}
                                  </div>
                                  <p className="text-xs font-bold mb-1 truncate">{w.name}</p>
                                  <p className="text-xs text-red-400">공격 +{w.atk}</p>
                                  {isEq && <p className="text-xs text-green-300 mt-1">✓ 착용중</p>}
                                  {isOther && <p className="text-xs text-orange-300 mt-1 truncate">{owner.name}</p>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* 방어구 */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold">🛡️ 방어구</h4>
                            {c.equipment.armor && (
                              <button
                                onClick={() => unequipItem(c.id, 'armor')}
                                className="text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                              >
                                해제
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {inventory.armors.map(a => {
                              const isEq = c.equipment.armor === a.id;
                              const owner = getItemOwner('armor', a.id);
                              const isOther = owner && owner.id !== c.id;
                              
                              return (
                                <button
                                  key={a.id}
                                  onClick={() => {
                                    if (isEq) {
                                      unequipItem(c.id, 'armor');
                                    } else if (isOther) {
                                      setConfirmModal({
                                        title: '장비 착용 확인',
                                        message: `${owner.name}이(가) ${a.name}을(를) 착용 중입니다. 해제하고 ${c.name}에게 장착하시겠습니까?`,
                                        onConfirm: () => {
                                          unequipItem(owner.id, 'armor');
                                          equipItem(c.id, 'armor', a.id);
                                        }
                                      });
                                    } else {
                                      equipItem(c.id, 'armor', a.id);
                                    }
                                  }}
                                  className={`p-2 rounded-lg border-2 transition ${
                                    isEq ? 'bg-green-700 border-green-500' :
                                    isOther ? 'bg-orange-700 border-orange-500' :
                                    'bg-gray-800 border-gray-700 hover:border-gray-500'
                                  }`}
                                >
                                  <div className={`text-xs font-bold mb-1 ${getRarityColor(a.rarity)}`}>
                                    {'⭐'.repeat(a.rarity)}
                                  </div>
                                  <p className="text-xs font-bold mb-1 truncate">{a.name}</p>
                                  <p className="text-xs text-blue-400">방어 +{a.def}</p>
                                  <p className="text-xs text-green-400">HP +{a.hp}</p>
                                  {isEq && <p className="text-xs text-green-300 mt-1">✓ 착용중</p>}
                                  {isOther && <p className="text-xs text-orange-300 mt-1 truncate">{owner.name}</p>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* 악세서리 */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold">💍 악세서리</h4>
                            {c.equipment.accessory && (
                              <button
                                onClick={() => unequipItem(c.id, 'accessory')}
                                className="text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                              >
                                해제
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {inventory.accessories.map(ac => {
                              const isEq = c.equipment.accessory === ac.id;
                              const owner = getItemOwner('accessory', ac.id);
                              const isOther = owner && owner.id !== c.id;
                              
                              return (
                                <button
                                  key={ac.id}
                                  onClick={() => {
                                    if (isEq) {
                                      unequipItem(c.id, 'accessory');
                                    } else if (isOther) {
                                      setConfirmModal({
                                        title: '장비 착용 확인',
                                        message: `${owner.name}이(가) ${ac.name}을(를) 착용 중입니다. 해제하고 ${c.name}에게 장착하시겠습니까?`,
                                        onConfirm: () => {
                                          unequipItem(owner.id, 'accessory');
                                          equipItem(c.id, 'accessory', ac.id);
                                        }
                                      });
                                    } else {
                                      equipItem(c.id, 'accessory', ac.id);
                                    }
                                  }}
                                  className={`p-2 rounded-lg border-2 transition ${
                                    isEq ? 'bg-green-700 border-green-500' :
                                    isOther ? 'bg-orange-700 border-orange-500' :
                                    'bg-gray-800 border-gray-700 hover:border-gray-500'
                                  }`}
                                >
                                  <div className={`text-xs font-bold mb-1 ${getRarityColor(ac.rarity)}`}>
                                    {'⭐'.repeat(ac.rarity)}
                                  </div>
                                  <p className="text-xs font-bold mb-1 truncate">{ac.name}</p>
                                  {ac.atk && <p className="text-xs text-red-400">공격 +{ac.atk}</p>}
                                  {ac.def && <p className="text-xs text-blue-400">방어 +{ac.def}</p>}
                                  {isEq && <p className="text-xs text-green-300 mt-1">✓ 착용중</p>}
                                  {isOther && <p className="text-xs text-orange-300 mt-1 truncate">{owner.name}</p>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* 팀 편성 화면 */}
        {currentTab === 'team' && (
          <div className="bg-black bg-opacity-40 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">팀 편성 (전열/후열)</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Shield size={20} className="text-red-500"/>
                전열 (3자리)
              </h3>
              <div className="flex gap-2">
                {[0, 1, 2].map(col => {
                  const charId = team.frontRow[col];
                  const chr = charId ? characters.find(x => x.id === charId) : null;
                  const s = chr ? calculateStats(chr) : null;
                  const eq = chr ? (chr.equipment || {}) : null;
                  return (
                    <div
                      key={col}
                      className={`border-2 rounded-lg flex-1 ${
                        chr 
                          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-red-600 p-2 cursor-pointer hover:border-red-500' 
                          : 'bg-red-900 bg-opacity-30 border-red-600 p-4 min-h-28 flex items-center justify-center'
                      }`}
                      onClick={() => { if (chr) removeFromTeam(charId); }}
                    >
                      {chr ? (
                        <div className="flex gap-2 w-full">
                          {/* 왼쪽: 이미지 */}
                          <div className="w-16 flex-shrink-0 flex flex-col">
                            <div className={`${getRarityColor(chr.rarity)} mb-1`}>
                              <p className="text-xs font-bold text-center">{'⭐'.repeat(chr.rarity)}</p>
                            </div>
                            {getCharIcon(chr.class)}
                          </div>
                          
                          {/* 오른쪽: 정보 */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div>
                              <h4 className="font-bold text-xs truncate">{chr.name}</h4>
                              <p className="text-xs text-gray-400">{chr.class} Lv.{chr.level}</p>
                            </div>
                            
                            {/* 스탯 - 한 줄 */}
                            <div className="bg-black bg-opacity-40 px-1.5 py-1 rounded flex justify-between text-xs">
                              <span>HP {s.hp}</span>
                              <span className="text-red-400">공 {s.atk}</span>
                              <span className="text-blue-400">방 {s.def}</span>
                            </div>
                            
                            {/* 스킬 - 세로 */}
                            <div className="bg-black bg-opacity-40 p-1 rounded">
                              <p className="text-xs text-gray-400 mb-0.5">스킬:</p>
                              {chr.skills.map((sk, i) => (
                                <p key={i} className="text-xs bg-purple-600 bg-opacity-50 px-1 py-0.5 rounded mb-0.5 truncate">
                                  {sk}
                                </p>
                              ))}
                            </div>
                            
                            {/* 장비 - 세로 */}
                            <div className="bg-black bg-opacity-40 p-1 rounded text-xs">
                              <p className="text-gray-400 mb-0.5">장비:</p>
                              {eq.weapon ? (
                                <p className="text-yellow-400 truncate">
                                  ⚔️{inventory.weapons.find(w => w.id === eq.weapon)?.name}
                                </p>
                              ) : (
                                <p className="text-gray-600">⚔️없음</p>
                              )}
                              {eq.armor ? (
                                <p className="text-blue-400 truncate">
                                  🛡️{inventory.armors.find(a => a.id === eq.armor)?.name}
                                </p>
                              ) : (
                                <p className="text-gray-600">🛡️없음</p>
                              )}
                              {eq.accessory ? (
                                <p className="text-purple-400 truncate">
                                  💍{inventory.accessories.find(ac => ac.id === eq.accessory)?.name}
                                </p>
                              ) : (
                                <p className="text-gray-600">💍없음</p>
                              )}
                            </div>
                          </div>
                        </div>
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
                <Star size={20} className="text-blue-500"/>
                후열 (3자리)
              </h3>
              <div className="flex gap-2">
                {[0, 1, 2].map(col => {
                  const charId = team.backRow[col];
                  const chr = charId ? characters.find(x => x.id === charId) : null;
                  const s = chr ? calculateStats(chr) : null;
                  const eq = chr ? (chr.equipment || {}) : null;
                  return (
                    <div
                      key={col}
                      className={`border-2 rounded-lg flex-1 ${
                        chr 
                          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-blue-600 p-2 cursor-pointer hover:border-blue-500' 
                          : 'bg-blue-900 bg-opacity-30 border-blue-600 p-4 min-h-28 flex items-center justify-center'
                      }`}
                      onClick={() => { if (chr) removeFromTeam(charId); }}
                    >
                      {chr ? (
                        <div className="flex gap-2 w-full">
                          {/* 왼쪽: 이미지 */}
                          <div className="w-16 flex-shrink-0 flex flex-col">
                            <div className={`${getRarityColor(chr.rarity)} mb-1`}>
                              <p className="text-xs font-bold text-center">{'⭐'.repeat(chr.rarity)}</p>
                            </div>
                            {getCharIcon(chr.class)}
                          </div>
                          
                          {/* 오른쪽: 정보 */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div>
                              <h4 className="font-bold text-xs truncate">{chr.name}</h4>
                              <p className="text-xs text-gray-400">{chr.class} Lv.{chr.level}</p>
                            </div>
                            
                            {/* 스탯 - 한 줄 */}
                            <div className="bg-black bg-opacity-40 px-1.5 py-1 rounded flex justify-between text-xs">
                              <span>HP {s.hp}</span>
                              <span className="text-red-400">공 {s.atk}</span>
                              <span className="text-blue-400">방 {s.def}</span>
                            </div>
                            
                            {/* 스킬 - 세로 */}
                            <div className="bg-black bg-opacity-40 p-1 rounded">
                              <p className="text-xs text-gray-400 mb-0.5">스킬:</p>
                              {chr.skills.map((sk, i) => (
                                <p key={i} className="text-xs bg-purple-600 bg-opacity-50 px-1 py-0.5 rounded mb-0.5 truncate">
                                  {sk}
                                </p>
                              ))}
                            </div>
                            
                            {/* 장비 - 세로 */}
                            <div className="bg-black bg-opacity-40 p-1 rounded text-xs">
                              <p className="text-gray-400 mb-0.5">장비:</p>
                              {eq.weapon ? (
                                <p className="text-yellow-400 truncate">
                                  ⚔️{inventory.weapons.find(w => w.id === eq.weapon)?.name}
                                </p>
                              ) : (
                                <p className="text-gray-600">⚔️없음</p>
                              )}
                              {eq.armor ? (
                                <p className="text-blue-400 truncate">
                                  🛡️{inventory.armors.find(a => a.id === eq.armor)?.name}
                                </p>
                              ) : (
                                <p className="text-gray-600">🛡️없음</p>
                              )}
                              {eq.accessory ? (
                                <p className="text-purple-400 truncate">
                                  💍{inventory.accessories.find(ac => ac.id === eq.accessory)?.name}
                                </p>
                              ) : (
                                <p className="text-gray-600">💍없음</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">빈 슬롯</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              💡 전열에 캐릭터가 있으면 후열은 일반 공격으로 타겟할 수 없습니다
            </p>

            <h3 className="text-xl font-bold mb-3">캐릭터 선택 (클릭하여 배치)</h3>
            <div className="grid grid-cols-5 gap-2">
              {characters.map(char => {
                const inTeam = getAllTeamMembers().includes(char.id);
                const s = calculateStats(char);
                return (
                  <div
                    key={char.id}
                    className={`bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-lg border-2 text-left ${
                      inTeam ? 'border-green-500' : 'border-gray-700'
                    } hover:border-blue-500`}
                  >
                    <div className="flex gap-2">
                      {/* 왼쪽: 이미지 */}
                      <div className="w-16 flex-shrink-0 relative">
                        <div className={`absolute top-1 left-1 z-10 ${getRarityColor(char.rarity)}`}>
                          <p className="text-xs font-bold">{'⭐'.repeat(char.rarity)}</p>
                        </div>
                        {getCharIcon(char.class)}
                      </div>
                      
                      {/* 오른쪽: 정보 */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div>
                          <h4 className="font-bold text-xs truncate">{char.name}</h4>
                          <p className="text-xs text-gray-400">{char.class} Lv.{char.level}</p>
                        </div>
                        
                        {/* 스탯 - 한 줄 */}
                        <div className="bg-black bg-opacity-40 px-1.5 py-1 rounded flex justify-between text-xs">
                          <span>HP {s.hp}</span>
                          <span className="text-red-400">공 {s.atk}</span>
                          <span className="text-blue-400">방 {s.def}</span>
                        </div>
                        
                        {/* 스킬 - 세로 */}
                        <div className="bg-black bg-opacity-40 p-1 rounded">
                          <p className="text-xs text-gray-400 mb-0.5">스킬:</p>
                          {char.skills.map((sk, i) => (
                            <p key={i} className="text-xs bg-purple-600 bg-opacity-50 px-1 py-0.5 rounded mb-0.5 truncate">
                              {sk}
                            </p>
                          ))}
                        </div>
                        
                        {/* 편성 버튼 */}
                        {inTeam ? (
                          <div className="bg-green-600 px-1 py-1 rounded text-center text-xs font-bold mt-1">
                            ✓ 편성됨
                          </div>
                        ) : (
                          <div className="flex gap-0.5 mt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const emptyCol = team.frontRow.findIndex(id => id === null);
                                if (emptyCol !== -1) setTeamPosition('front', emptyCol, char.id);
                              }}
                              className="flex-1 bg-red-600 hover:bg-red-700 px-1 py-1 rounded text-xs font-bold"
                            >
                              전열
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const emptyCol = team.backRow.findIndex(id => id === null);
                                if (emptyCol !== -1) setTeamPosition('back', emptyCol, char.id);
                              }}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 px-1 py-1 rounded text-xs font-bold"
                            >
                              후열
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI 설정 화면 */}
        {currentTab === 'ai' && (
          <div className="bg-black bg-opacity-40 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">AI 전투 전략 설정</h2>
            <div className="space-y-4">
              {getAllTeamMembers().map(charId => {
                const chr = characters.find(x => x.id === charId);
                if (!chr) return null;
                
                const ai = aiSettings[charId] || {
                  prioritySkill: chr.skills[0],
                  targetType: '최약'
                };
                
                return (
                  <div key={charId} className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <Settings size={20}/>
                      {chr.name}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          우선 사용 스킬
                        </label>
                        <select
                          value={ai.prioritySkill}
                          onChange={(e) => updateAiSetting(charId, 'prioritySkill', e.target.value)}
                          className="w-full bg-gray-700 p-2 rounded text-white"
                        >
                          {chr.skills.map(skill => (
                            <option key={skill} value={skill}>{skill}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          타겟 우선순위
                        </label>
                        <select
                          value={ai.targetType}
                          onChange={(e) => updateAiSetting(charId, 'targetType', e.target.value)}
                          className="w-full bg-gray-700 p-2 rounded text-white"
                        >
                          <option value="최약">HP가 가장 낮은 적</option>
                          <option value="최강">HP가 가장 높은 적</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 전투 화면 - 계속 */}
        {currentTab === 'battle' && (
          <div className="bg-black bg-opacity-40 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">던전 전투</h2>
            
            {/* 전투 시작 전 정보 표시 */}
            {!battleState && (
              <div className="relative bg-gradient-to-b from-indigo-900 to-purple-900 rounded-lg p-4 mb-4" style={{ minHeight: '700px' }}>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 px-6 py-2 rounded-lg z-10">
                  <p className="font-bold text-lg">전투 준비</p>
                </div>
                
                {/* 전투 시작 버튼 - 중앙 배치 */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <button
                    onClick={startBattle}
                    disabled={isBattling}
                    className="bg-red-600 px-8 py-4 rounded-lg font-bold text-xl hover:bg-red-700 disabled:bg-gray-600 shadow-2xl"
                  >
                    {isBattling ? '전투 중...' : '전투 시작'}
                  </button>
                </div>
                
                {/* 아군 후열 */}
                <div className="absolute left-4 top-20">
                  <p className="text-xs text-blue-400 font-bold mb-2 text-center">후열</p>
                  <div className="flex flex-col gap-3">
                    {team.backRow.map((charId, idx) => {
                      if (!charId) return null;
                      const chr = characters.find(x => x.id === charId);
                      if (!chr) return null;
                      const s = calculateStats(chr);
                      return (
                        <div
                          key={charId}
                          className="relative bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg p-3 w-28 border-2 border-blue-500"
                        >
                          <div className="flex flex-col items-center">
                            <p className="text-xs font-bold truncate w-full text-center mb-2">{chr.name}</p>
                            <div className="w-16 h-16 overflow-hidden rounded flex-shrink-0 mb-2">{getCharIcon(chr.class)}</div>
                            <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                            <p className="text-xs text-center text-gray-300">
                              {s.hp}/{s.hp}
                            </p>
                            <div className="mt-1 text-xs text-center">
                              <p className="text-red-400">공 {s.atk}</p>
                              <p className="text-blue-400">방 {s.def}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* 아군 전열 */}
                <div className="absolute left-36 top-20">
                  <p className="text-xs text-red-400 font-bold mb-2 text-center">전열</p>
                  <div className="flex flex-col gap-3">
                    {team.frontRow.map((charId, idx) => {
                      if (!charId) return null;
                      const chr = characters.find(x => x.id === charId);
                      if (!chr) return null;
                      const s = calculateStats(chr);
                      return (
                        <div
                          key={charId}
                          className="relative bg-gradient-to-br from-red-800 to-red-900 rounded-lg p-3 w-28 border-2 border-red-500"
                        >
                          <div className="flex flex-col items-center">
                            <p className="text-xs font-bold truncate w-full text-center mb-2">{chr.name}</p>
                            <div className="w-16 h-16 overflow-hidden rounded flex-shrink-0 mb-2">{getCharIcon(chr.class)}</div>
                            <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                            <p className="text-xs text-center text-gray-300">
                              {s.hp}/{s.hp}
                            </p>
                            <div className="mt-1 text-xs text-center">
                              <p className="text-red-400">공 {s.atk}</p>
                              <p className="text-blue-400">방 {s.def}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* 적 전열 */}
                <div className="absolute right-36 top-20">
                  <p className="text-xs text-red-400 font-bold mb-2 text-center">전열</p>
                  <div className="flex flex-col gap-3">
                    <div className="relative bg-gradient-to-br from-red-800 to-red-900 rounded-lg p-3 w-28 border-2 border-red-500">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-2xl">👹</div>
                        <p className="text-xs font-bold truncate flex-1">고블린</p>
                      </div>
                      <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <p className="text-xs text-center text-gray-300">50/50</p>
                      <div className="mt-1 text-xs text-center">
                        <p className="text-red-400">공 15</p>
                      </div>
                    </div>
                    <div className="relative bg-gradient-to-br from-red-800 to-red-900 rounded-lg p-3 w-28 border-2 border-red-500">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-2xl">👹</div>
                        <p className="text-xs font-bold truncate flex-1">고블린전사</p>
                      </div>
                      <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <p className="text-xs text-center text-gray-300">60/60</p>
                      <div className="mt-1 text-xs text-center">
                        <p className="text-red-400">공 18</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 적 후열 */}
                <div className="absolute right-4 top-20">
                  <p className="text-xs text-purple-400 font-bold mb-2 text-center">후열</p>
                  <div className="flex flex-col gap-3">
                    <div className="relative bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg p-3 w-28 border-2 border-purple-500">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-2xl">👺</div>
                        <p className="text-xs font-bold truncate flex-1">오크</p>
                      </div>
                      <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <p className="text-xs text-center text-gray-300">80/80</p>
                      <div className="mt-1 text-xs text-center">
                        <p className="text-red-400">공 20</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {battleState && battleState.team && battleState.enemies && (
              <div className="relative bg-gradient-to-b from-indigo-900 to-purple-900 rounded-lg p-4 mb-4" style={{ minHeight: '700px' }}>
                {/* 전투 메시지 */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 px-6 py-2 rounded-lg z-10">
                  <p className="font-bold text-lg">{battleState.message}</p>
                </div>
                
                {/* 턴 표시 */}
                <div className="absolute top-4 right-4 bg-blue-600 px-4 py-2 rounded-lg">
                  <p className="font-bold">턴 {battleState.turn}</p>
                </div>
                
                {/* 아군 후열 */}
                <div className="absolute left-4 top-20">
                  <p className="text-xs text-blue-400 font-bold mb-2 text-center">후열</p>
                  <div className="flex flex-col gap-3">
                    {battleState.team.backRow.map(c => (
                      <div
                        key={c.id}
                        data-card-id={c.id}
                        className={`relative bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg p-3 w-28 border-2 ${
                          c.currentHp > 0 ? 'border-blue-500' : 'border-gray-600 opacity-50'
                        }`}
                        style={{ overflow: 'visible', transition: 'none' }}
                      >
                        <div className="flex flex-col items-center">
                          <p className="text-xs font-bold truncate w-full text-center mb-2">{c.name}</p>
                          <div className="w-16 h-16 overflow-hidden rounded flex-shrink-0 mb-2">{getCharIcon(c.class)}</div>
                          <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(c.currentHp / c.maxHp) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-center text-gray-300">
                            {Math.max(0, c.currentHp)}/{c.maxHp}
                          </p>
                        </div>
                        
                        {/* 피격 효과 */}
                        {hitEffects.map(ef => {
                          const isMatch = !ef.isEnemy && ef.targetId === c.id;
                          return isMatch ? (
                            <div
                              key={ef.id}
                              className="absolute"
                              style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 100,
                                pointerEvents: 'none'
                              }}
                            >
                              <div className="text-6xl font-bold animate-bounce">
                                {ef.effectType === 'magic' ? '✨' : '💥'}
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 아군 전열 */}
                <div className="absolute left-36 top-20">
                  <p className="text-xs text-red-400 font-bold mb-2 text-center">전열</p>
                  <div className="flex flex-col gap-3">
                    {battleState.team.frontRow.map(c => (
                      <div
                        key={c.id}
                        data-card-id={c.id}
                        className={`relative bg-gradient-to-br from-red-800 to-red-900 rounded-lg p-3 w-28 border-2 ${
                          c.currentHp > 0 ? 'border-red-500' : 'border-gray-600 opacity-50'
                        }`}
                        style={{ overflow: 'visible', transition: 'none' }}
                      >
                        <div className="flex flex-col items-center">
                          <p className="text-xs font-bold truncate w-full text-center mb-2">{c.name}</p>
                          <div className="w-16 h-16 overflow-hidden rounded flex-shrink-0 mb-2">{getCharIcon(c.class)}</div>
                          <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(c.currentHp / c.maxHp) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-center text-gray-300">
                            {Math.max(0, c.currentHp)}/{c.maxHp}
                          </p>
                        </div>
                        
                        {hitEffects.map(ef => {
                          const isMatch = !ef.isEnemy && ef.targetId === c.id;
                          return isMatch ? (
                            <div
                              key={ef.id}
                              className="absolute"
                              style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 100,
                                pointerEvents: 'none'
                              }}
                            >
                              <div className="text-6xl font-bold animate-bounce">
                                {ef.effectType === 'magic' ? '✨' : '💥'}
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 적 전열 */}
                <div className="absolute right-36 top-20">
                  <p className="text-xs text-red-400 font-bold mb-2 text-center">전열</p>
                  <div className="flex flex-col gap-3">
                    {battleState.enemies.frontRow.map((enemy, idx) => (
                      <div
                        key={idx}
                        data-card-id={`enemy_${enemy.name}_${enemy.row}_${enemy.col}`}
                        className="relative bg-gradient-to-br from-red-800 to-red-900 rounded-lg p-3 w-28 border-2 border-red-500"
                        style={{ overflow: 'visible', transition: 'none' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl">👹</div>
                          <p className="text-xs font-bold truncate flex-1">{enemy.name}</p>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-center text-gray-300">
                          {Math.max(0, enemy.currentHp)}/{enemy.maxHp}
                        </p>
                        
                        {hitEffects.map(ef => {
                          const isMatch = ef.isEnemy && ef.targetName === enemy.name && ef.targetId.includes(`${enemy.row}_`);
                          return isMatch ? (
                            <div
                              key={ef.id}
                              className="absolute"
                              style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 100,
                                pointerEvents: 'none'
                              }}
                            >
                              <div className="text-6xl font-bold animate-bounce">
                                {ef.effectType === 'magic' ? '✨' : '💥'}
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 적 후열 */}
                <div className="absolute right-4 top-20">
                  <p className="text-xs text-purple-400 font-bold mb-2 text-center">후열</p>
                  <div className="flex flex-col gap-3">
                    {battleState.enemies.backRow.map((enemy, idx) => (
                      <div
                        key={idx}
                        data-card-id={`enemy_${enemy.name}_${enemy.row}_${enemy.col}`}
                        className="relative bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg p-3 w-28 border-2 border-purple-500"
                        style={{ overflow: 'visible', transition: 'none' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl">👺</div>
                          <p className="text-xs font-bold truncate flex-1">{enemy.name}</p>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-center text-gray-300">
                          {Math.max(0, enemy.currentHp)}/{enemy.maxHp}
                        </p>
                        
                        {hitEffects.map(ef => {
                          const isMatch = ef.isEnemy && ef.targetName === enemy.name && ef.targetId.includes(`${enemy.row}_`);
                          return isMatch ? (
                            <div
                              key={ef.id}
                              className="absolute"
                              style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 100,
                                pointerEvents: 'none'
                              }}
                            >
                              <div className="text-6xl font-bold animate-bounce">
                                {ef.effectType === 'magic' ? '✨' : '💥'}
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 전투 결과 팝업 */}
                {battleResult && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-40">
                    <div className={`p-8 rounded-2xl shadow-2xl text-center ${
                      battleResult.type === 'victory' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                      battleResult.type === 'defeat' ? 'bg-gradient-to-br from-red-600 to-red-800' :
                      'bg-gradient-to-br from-gray-600 to-gray-800'
                    }`}>
                      {battleResult.type === 'victory' && (
                        <>
                          <div className="text-6xl mb-4">🎉</div>
                          <h2 className="text-4xl font-bold mb-4">승리!</h2>
                          <div className="bg-black bg-opacity-30 p-4 rounded-lg mb-4">
                            <p className="text-xl font-bold mb-2">보상</p>
                            <div className="flex justify-center gap-4">
                              <div className="flex items-center gap-2">
                                <Star size={24}/>
                                <span className="text-2xl font-bold">+{battleResult.gold}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Gem size={24}/>
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
                      <button
                        onClick={() => {
                          setIsBattling(false);
                          setBattleState(null);
                          setBattleResult(null);
                        }}
                        className="mt-4 bg-white text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
                      >
                        확인
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 전투 로그 */}
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
}

export default App;