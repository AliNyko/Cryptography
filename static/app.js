document.addEventListener('DOMContentLoaded', () => {
    const els = {
        inputText: document.getElementById('input-text'),
        inputLabel: document.getElementById('input-label'),
        modes: document.getElementsByName('mode'),
        category: document.getElementsByName('category'),
        algorithm: document.getElementById('algorithm'),
        key: document.getElementById('key'),
        keyHint: document.getElementById('key-hint'),
        keyDesc: document.getElementById('key-desc'),
        btnGenKey: document.getElementById('btn-gen-key'),
        btnAction: document.getElementById('btn-action'),
        resultCard: document.getElementById('result-card'),
        errorMsg: document.getElementById('error-msg'),
        
        // Decrypt inputs
        decryptFields: document.getElementById('decrypt-fields'),
        groupNonce: document.getElementById('group-nonce'),
        groupTag: document.getElementById('group-tag'),
        groupIv: document.getElementById('group-iv'),
        inputNonce: document.getElementById('input-nonce'),
        inputTag: document.getElementById('input-tag'),
        inputIv: document.getElementById('input-iv'),

        // Results
        resMain: document.getElementById('res-main'),
        resLabelMain: document.getElementById('res-label-main'),
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
    els.modes.forEach(r => r.addEventListener('change', updateUIState));
    els.category.forEach(r => r.addEventListener('change', updateAlgorithmSelect));
    els.algorithm.addEventListener('change', updateKeyUI);
    els.btnGenKey.addEventListener('click', generateKey);
    els.btnAction.addEventListener('click', performAction);

    function getMode() {
        return document.querySelector('input[name="mode"]:checked').value;
    }

    function getCategory() {
        return document.querySelector('input[name="category"]:checked').value;
    }

    function updateUIState() {
        const mode = getMode();
        
        if (mode === 'encrypt') {
            els.inputLabel.textContent = 'Plaintext';
            els.inputText.placeholder = 'Enter text to encrypt...';
            els.btnAction.textContent = 'Encrypt';
            els.decryptFields.classList.add('hidden');
        } else {
            els.inputLabel.textContent = 'Ciphertext (Base64)';
            els.inputText.placeholder = 'Enter Base64 ciphertext...';
            els.btnAction.textContent = 'Decrypt';
        }
        updateAlgorithmSelect();
    }

    function updateAlgorithmSelect() {
        const cat = getCategory();
        const algos = algorithms[cat] || [];
        els.algorithm.innerHTML = algos.map(a => `<option value="${a}">${a}</option>`).join('');
        updateKeyUI();
    }

    function updateKeyUI() {
        const algo = els.algorithm.value;
        const mode = getMode();
        
        els.key.value = '';
        els.keyDesc.textContent = '';
        els.key.type = 'text'; 
        
        // Key Inputs
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
            els.keyDesc.textContent = 'Optional. Must match message length (bytes).';
            els.btnGenKey.style.display = mode === 'encrypt' ? 'block' : 'none'; 
        } else {
            // Modern
            els.keyHint.textContent = '(Base64)';
            els.keyDesc.textContent = 'Base64 encoded key.';
            els.btnGenKey.style.display = mode === 'encrypt' ? 'block' : 'none'; 
        }

        // Decrypt Fields visibility
        if (mode === 'decrypt') {
            els.decryptFields.classList.remove('hidden');
            els.groupNonce.classList.add('hidden');
            els.groupTag.classList.add('hidden');
            els.groupIv.classList.add('hidden');

            if (algo === 'AES') {
                els.groupNonce.classList.remove('hidden');
                els.groupTag.classList.remove('hidden');
            } else if (algo === '3DES') {
                els.groupIv.classList.remove('hidden');
            } else {
                // Classic algos don't need extra fields usually
                if (cat === 'classic') els.decryptFields.classList.add('hidden');
            }
        } else {
            els.decryptFields.classList.add('hidden');
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

    async function performAction() {
        els.errorMsg.classList.add('hidden');
        els.resultCard.classList.add('hidden');
        
        const mode = getMode();
        const cat = getCategory();
        const algo = els.algorithm.value;
        const text = els.inputText.value;
        const key = els.key.value || null;

        if (!text) {
            showError("Please enter input text");
            return;
        }

        const payload = {
            category: cat,
            algorithm: algo,
            key: key
        };

        let endpoint = '';
        
        if (mode === 'encrypt') {
            endpoint = '/api/encrypt';
            payload.plaintext = text;
        } else {
            endpoint = '/api/decrypt';
            payload.ciphertext = text;
            if (algo === 'AES') {
                payload.nonce = els.inputNonce.value;
                payload.tag = els.inputTag.value;
            } else if (algo === '3DES') {
                payload.iv = els.inputIv.value;
            }
        }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.detail || 'Error processing request');
            
            showResult(data, mode);
        } catch (e) {
            showError(e.message);
        }
    }

    function showResult(data, mode) {
        if (mode === 'encrypt') {
            els.resLabelMain.textContent = 'Ciphertext (Base64):';
            els.resMain.textContent = data.ciphertext;
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
        } else {
            // Decrypt
            els.resLabelMain.textContent = 'Plaintext:';
            els.resMain.textContent = data.plaintext;
            els.resKey.textContent = 'N/A (Used Input Key)';
            els.metaFields.innerHTML = '';
        }
        
        els.resultCard.classList.remove('hidden');
    }

    function showError(msg) {
        els.errorMsg.textContent = msg;
        els.errorMsg.classList.remove('hidden');
    }
});
