document.addEventListener('DOMContentLoaded', () => {
    const els = {
        plaintext: document.getElementById('plaintext'),
        category: document.getElementsByName('category'),
        algorithm: document.getElementById('algorithm'),
        key: document.getElementById('key'),
        keyHint: document.getElementById('key-hint'),
        keyDesc: document.getElementById('key-desc'),
        btnGenKey: document.getElementById('btn-gen-key'),
        btnEncrypt: document.getElementById('btn-encrypt'),
        resultCard: document.getElementById('result-card'),
        errorMsg: document.getElementById('error-msg'),
        resPlaintext: document.getElementById('res-plaintext'),
        resCiphertext: document.getElementById('res-ciphertext'),
        resKey: document.getElementById('res-key'),
        metaFields: document.getElementById('meta-fields')
    };

    let algorithms = {};

    // Fetch algorithms
    fetch('/api/algorithms')
        .then(r => r.json())
        .then(data => {
            algorithms = data;
            updateAlgorithmSelect();
        });

    // Listeners
    els.category.forEach(r => r.addEventListener('change', updateAlgorithmSelect));
    els.algorithm.addEventListener('change', updateKeyUI);
    els.btnGenKey.addEventListener('click', generateKey);
    els.btnEncrypt.addEventListener('click', encrypt);

    function getCategory() {
        return document.querySelector('input[name="category"]:checked').value;
    }

    function updateAlgorithmSelect() {
        const cat = getCategory();
        const algos = algorithms[cat] || [];
        els.algorithm.innerHTML = algos.map(a => `<option value="${a}">${a}</option>`).join('');
        updateKeyUI();
    }

    function updateKeyUI() {
        const algo = els.algorithm.value;
        els.key.value = '';
        els.keyDesc.textContent = '';
        els.key.type = 'text'; // default
        
        if (algo === 'Caesar') {
            els.keyHint.textContent = '(0-25)';
            els.key.type = 'number';
            els.key.min = 0;
            els.key.max = 25;
            els.keyDesc.textContent = 'Enter shift amount (0-25)';
            els.btnGenKey.style.display = 'block'; 
        } else if (algo === 'Monoalphabetic') {
            els.keyHint.textContent = '(26 letters)';
            els.keyDesc.textContent = '26 unique English letters';
            els.btnGenKey.style.display = 'block';
        } else if (algo === 'Vernam') {
            els.keyHint.textContent = '(Base64 or Text)';
            els.keyDesc.textContent = 'Optional. Must match plaintext length (bytes).';
            els.btnGenKey.style.display = 'none'; 
        } else {
            // Modern
            els.keyHint.textContent = '(Base64)';
            els.keyDesc.textContent = 'Optional (Base64 encoded). Leave empty to generate.';
            els.btnGenKey.style.display = 'none'; 
        }
    }

    function generateKey() {
        const algo = els.algorithm.value;
        if (algo === 'Caesar') {
            els.key.value = Math.floor(Math.random() * 26);
        } else if (algo === 'Monoalphabetic') {
            const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            for (let i = alpha.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [alpha[i], alpha[j]] = [alpha[j], alpha[i]];
            }
            els.key.value = alpha.join('');
        }
    }

    async function encrypt() {
        els.errorMsg.classList.add('hidden');
        els.resultCard.classList.add('hidden');
        
        const payload = {
            category: getCategory(),
            algorithm: els.algorithm.value,
            plaintext: els.plaintext.value,
            key: els.key.value || null
        };

        if (!payload.plaintext) {
            showError("Please enter plaintext");
            return;
        }

        try {
            const res = await fetch('/api/encrypt', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.detail || 'Error encrypting');
            
            showResult(data);
        } catch (e) {
            showError(e.message);
        }
    }

    function showResult(data) {
        els.resPlaintext.textContent = els.plaintext.value;
        els.resCiphertext.textContent = data.ciphertext;
        els.resKey.textContent = data.key;
        
        // Meta
        els.metaFields.innerHTML = '';
        if (data.meta) {
            for (const [k, v] of Object.entries(data.meta)) {
                const div = document.createElement('div');
                div.className = 'result-item';
                div.innerHTML = `<span class="label">${k}:</span> <div class="value code">${v}</div>`;
                els.metaFields.appendChild(div);
            }
        }
        
        els.resultCard.classList.remove('hidden');
    }

    function showError(msg) {
        els.errorMsg.textContent = msg;
        els.errorMsg.classList.remove('hidden');
    }
});
