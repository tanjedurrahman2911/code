// --- script.js (Connection and Logic) ---

// ⚠️ IMPORTANT: REPLACE THIS URL WITH YOUR WEB APP URL FROM STEP 1.2!
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyc5qJy36l0Z6402QJDu_mK5YyB3vPK9OItqBfMiotVAJs9RCF_Z4lU_-VI4hRDwMQh/exec'; 

// Names for the three people
const PERSON_NAMES = ["TANJED", "ABDULLAH", "JIM"]; 
// Column indices for the script (C, D, E columns)
const PERSON_INDICES = [2, 3, 4]; 

// Helper function to send data to the backend
async function sendRequest(action, data = {}) {
    const url = new URL(SCRIPT_URL);
    url.searchParams.append('action', action);
    for (const key in data) {
        url.searchParams.append(key, data[key]);
    }
    try {
        const response = await fetch(url, { method: 'GET' });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An error occurred communicating with the backend.');
        return { status: 'ERROR' };
    }
}

// ... (Rest of the script.js code) ...

// 1. Handle form submission (Adding a new problem)
document.getElementById('problemForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const link = document.getElementById('linkInput').value;
    const button = e.target.querySelector('button');
    button.disabled = true;
    button.textContent = 'Adding...';

    await sendRequest('addProblem', { link: link });
    
    document.getElementById('linkInput').value = '';
    loadProblems();
    button.disabled = false;
    button.textContent = 'Add Problem';
});


// 2. Load problems from the database
async function loadProblems() {
    const listDiv = document.getElementById('problemList');
    listDiv.innerHTML = '<div class="loading">Loading problems...</div>';

    const result = await sendRequest('getData');
    
    if (result.status === 'SUCCESS') {
        renderProblems(result.data);
    } else {
         listDiv.innerHTML = '<div class="loading" style="color:red;">Error loading data. Check console.</div>';
    }
}

// 3. Render problems list
function renderProblems(problems) {
    const listDiv = document.getElementById('problemList');
    listDiv.innerHTML = '';
    
    const activeProblems = problems.filter(p => p.display === 'true');

    if (activeProblems.length === 0) {
        listDiv.innerHTML = '<div class="loading">No active problems! Time to find some.</div>';
        return;
    }

    activeProblems.forEach(problem => {
        const item = document.createElement('div');
        item.className = 'problem-item';
        
        const solvedCount = [problem.person1_solved, problem.person2_solved, problem.person3_solved].filter(s => s !== '').length;
        
        if (solvedCount === 3) {
            item.classList.add('solved-item');
        }

        const linkDiv = document.createElement('div');
        linkDiv.className = 'problem-link';
        linkDiv.innerHTML = `<a href="${problem.problemLink}" target="_blank">${problem.problemLink}</a>`;
        item.appendChild(linkDiv);

        const solversDiv = document.createElement('div');
        solversDiv.className = 'solvers';
        
        for (let i = 0; i < 3; i++) {
            const solvedKey = `person${i + 1}_solved`; 
            const isChecked = problem[solvedKey] !== '';
            
            const checkboxId = `cb-${problem.id}-${i}`;
            const label = document.createElement('label');
            
            label.innerHTML = `<input type="checkbox" id="${checkboxId}" data-id="${problem.id}" data-index="${PERSON_INDICES[i]}" ${isChecked ? 'checked' : ''} onchange="updateStatus(this)"> ${PERSON_NAMES[i]}`;
            solversDiv.appendChild(label);
        }
        
        item.appendChild(solversDiv);
        listDiv.appendChild(item);
    });
}

// 4. Update solved status
async function updateStatus(checkbox) {
    const id = checkbox.dataset.id;
    const index = checkbox.dataset.index;
    const isChecked = checkbox.checked;
    
    await sendRequest('updateSolvedStatus', {
        id: id,
        personIndex: index,
        isChecked: isChecked.toString()
    });
    
    loadProblems(); 
}

// Initial load
window.onload = loadProblems;
