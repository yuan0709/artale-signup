// 1. 把你剛剛複製的 Google 網址貼在下面這行引號內
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzCBEFU8rnPEurYx_t0-bK6dY7qj1Tz7lkHKonijC82CT7FVZXXpbqaC253Q8nETAfU/exec';

const levelInput = document.getElementById('level');
const jobSelect = document.getElementById('job');

// 職業對照表 [三轉, 四轉]
const jobPairs = [
    ["祭司", "主教"], ["火毒", "火毒"], ["冰雷", "冰雷"], 
    ["遊俠", "箭神"], ["狙擊手", "神射手"], ["十字軍", "英雄"], 
    ["龍騎士", "黑騎士"], ["騎士", "聖騎士"], 
    ["神偷(刀賊)", "暗影神偷(刀賊)"], ["暗殺者(標賊)", "夜使者(標賊)"], 
    ["格鬥者", "拳霸"], ["神槍手", "槍神"]
];

// 更新職業選單 (連動等級)
function updateJobList() {
    const level = parseInt(levelInput.value) || 0;
    const currentJob = jobSelect.value;
    const isOver120 = level >= 120;
    let newJobToSelect = "";

    jobSelect.innerHTML = "";
    jobPairs.forEach(pair => {
        const lowJob = pair[0];
        const highJob = pair[1];
        const displayJob = isOver120 ? highJob : lowJob;
        
        const option = document.createElement('option');
        option.value = displayJob;
        option.textContent = displayJob;
        jobSelect.appendChild(option);

        if (currentJob === lowJob || currentJob === highJob) {
            newJobToSelect = displayJob;
        }
    });
    if (newJobToSelect) jobSelect.value = newJobToSelect;
}

levelInput.addEventListener('input', updateJobList);
updateJobList(); 

// 攔截表單送出
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // 抓取資料
    const level = parseInt(levelInput.value);
    const selectedBosses = Array.from(document.querySelectorAll('input[name="boss"]:checked')).map(cb => cb.value);
    const selectedTimes = Array.from(document.querySelectorAll('input[name="time"]:checked')).map(cb => cb.value);

    // 規則檢查
    if (selectedBosses.length === 0 || selectedTimes.length === 0) {
        alert("❌ 請選擇副本與至少一個出團時間！");
        return;
    }
    if (selectedBosses.includes('殘暴炎魔') && level < 135) {
        alert("❌ 炎魔需要等級 135 以上！");
        return;
    }

    // 封裝 JSON 資料
    const finalData = {
        id: document.getElementById('playerId').value,
        level: level,
        job: jobSelect.value,
        bosses: selectedBosses,
        times: selectedTimes,
        note: document.getElementById('timeNote').value,
        submitTime: new Date().toLocaleString()
    };

    // --- 關鍵修改：傳送到 Google Sheets ---
    try {
        // 顯示「處理中...」讓使用者知道有在跑
        const btn = e.target.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = "傳送中...";
        btn.disabled = true;

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // 重要：避免跨網域問題
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalData)
        });

        // 註：因為用 no-cors，response 會是空的，但資料會進去
        alert("🎉 報名成功！資料已同步至 Google 試算表。");
        btn.innerText = originalText;
        btn.disabled = false;
        document.getElementById('signupForm').reset(); // 清空表單
        updateJobList(); // 重置職業選單

    } catch (error) {
        console.error("錯誤:", error);
        alert("連線失敗，請檢查網路或網址是否正確。");
    }
});