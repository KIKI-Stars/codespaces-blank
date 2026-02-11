// BitLife-Style Game Engine
console.log('✓ game-bitlife.js loaded');

window.onerror = function(msg, url, lineNumber, columnNumber, error) {
    console.error('Global error:', msg, 'at', lineNumber + ':' + columnNumber);
    console.error('Error object:', error);
    return false;
};

class BitLifeGame {
    constructor() {
        this.character = {
            name: 'Alex',
            gender: 'male',
            country: 'usa',
            age: 0,
            year: 0,
            health: 100,
            happiness: 100,
            smarts: 50,
            looks: 50,
            money: 0,
            traits: [],
            job: 'Student',
            salary: 0,
            education: 'Elementary School',
            relationshipsList: [],
            married: false,
            spouse: null,
            children: [],
            parents: { father: 'Unknown', mother: 'Unknown' },
            achievements: []
        };

        this.lifeStages = {
            0: 'childhood',
            13: 'teen',
            18: 'adult',
            65: 'elderly'
        };

        this.careers = [
            { name: 'Student', salary: 0, minSmarts: 0, minAge: 0 },
            { name: 'Cashier', salary: 18000, minSmarts: 20, minAge: 16 },
            { name: 'Barista', salary: 20000, minSmarts: 20, minAge: 16 },
            { name: 'Waiter', salary: 22000, minSmarts: 20, minAge: 18 },
            { name: 'Teacher', salary: 45000, minSmarts: 70, minAge: 22 },
            { name: 'Doctor', salary: 120000, minSmarts: 90, minAge: 26 },
            { name: 'Lawyer', salary: 100000, minSmarts: 85, minAge: 24 },
            { name: 'Engineer', salary: 90000, minSmarts: 80, minAge: 22 },
            { name: 'Business Analyst', salary: 70000, minSmarts: 70, minAge: 21 }
        ];

        this.events = [];
        this.currentEvent = null;
        this.currentChoices = [];
        this.gameRunning = false;
        this.showStartModal = true;
    }

    getCurrentStage() {
        for (const [minAge, stage] of Object.entries(this.lifeStages).reverse()) {
            if (this.character.age >= minAge) return stage;
        }
        return 'childhood';
    }

    addEvent(text, type = 'info') {
        this.events.push({ text, type, age: this.character.age });
        if (this.events.length > 50) this.events.shift();
    }

    generateYearEvent() {
        const stage = this.getCurrentStage();
        const random = Math.random();

        // Health events
        if (random < 0.15) {
            if (this.character.health < 70) {
                this.character.health = Math.min(this.character.health + 20, 100);
                this.addEvent(`💊 You recovered from an illness`, 'positive');
            }
        }

        // Random happiness events
        if (random < 0.25) {
            this.character.happiness = Math.max(this.character.happiness - 15, 0);
            this.addEvent(`😔 You had a tough year`, 'negative');
        }

        // Money events
        if (random < 0.35 && this.character.money > 1000) {
            const loss = Math.floor(Math.random() * 2000);
            this.character.money -= loss;
            this.addEvent(`💸 Unexpected expenses: -$${loss}`, 'negative');
        } else if (random < 0.45) {
            const gain = 500 + Math.floor(Math.random() * 2000);
            this.character.money += gain;
            this.addEvent(`💰 Found money: +$${gain}`, 'positive');
        }

        // Natural decay
        this.character.health = Math.max(this.character.health - 2, 0);
        if (this.character.age > 60) {
            this.character.health = Math.max(this.character.health - 5, 0);
        }

        // Job salary
        if (this.character.salary > 0) {
            this.character.money += this.character.salary;
        }
    }

    createDecisionEvent() {
        const stage = this.getCurrentStage();
        const age = this.character.age;
        let event = null;

        if (stage === 'childhood' && age >= 5 && age <= 12) {
            const childEvents = [
                {
                    title: 'School Activity',
                    description: 'Your teacher offers you a chance to participate in an activity. What do you do?',
                    choices: [
                        { text: 'Join the sports team 🏃', effects: { looks: 10, health: 10, happiness: 15 }, outcome: '+Health +Happiness' },
                        { text: 'Join the debate club 🎤', effects: { smarts: 15, happiness: 10 }, outcome: '+Smarts +Happiness' },
                        { text: 'Ignore and play video games 🎮', effects: { happiness: 5, health: -5 }, outcome: '-Health' }
                    ]
                },
                {
                    title: 'Friendship',
                    description: 'Someone at school wants to be your friend.',
                    choices: [
                        { text: 'Accept and make a new friend 👋', effects: { happiness: 20, relationshipsList: 'Friend' }, outcome: '+Friend' },
                        { text: 'Politely decline 😊', effects: { happiness: 5 }, outcome: 'Neutral' },
                        { text: 'Be mean to them 😠', effects: { happiness: -10 }, outcome: 'Bad karma' }
                    ]
                }
            ];
            event = childEvents[Math.floor(Math.random() * childEvents.length)];
        } else if (stage === 'teen' && age >= 13 && age <= 17) {
            const teenEvents = [
                {
                    title: 'High School Decision',
                    description: 'What do you focus on in high school?',
                    choices: [
                        { text: 'Study hard for good grades 📚', effects: { smarts: 20, happiness: -10 }, outcome: '+Smarts' },
                        { text: 'Make friends and socialize 👥', effects: { happiness: 25, smarts: -5, relationshipsList: 'Friend' }, outcome: '+Relationships' },
                        { text: 'Join sports team 🏆', effects: { looks: 15, health: 15, happiness: 10 }, outcome: '+Health +Looks' },
                        { text: 'Start dating 💕', effects: { happiness: 30, relationshipsList: 'Lover' }, outcome: '+Love' }
                    ]
                },
                {
                    title: 'First Job',
                    description: 'Interested in working part-time?',
                    choices: [
                        { text: 'Get a part-time job 💼', effects: { money: 5000, health: -5 }, outcome: '+$5000' },
                        { text: 'Focus on school 📖', effects: { smarts: 15 }, outcome: '+Smarts' },
                        { text: 'Relax and have fun 🎉', effects: { happiness: 15, money: -1000 }, outcome: '+Happiness' }
                    ]
                }
            ];
            event = teenEvents[Math.floor(Math.random() * teenEvents.length)];
        } else if (stage === 'adult' && age >= 18 && age <= 64) {
            const adultEvents = [
                {
                    title: 'Career Opportunity',
                    description: 'You have a chance to change careers or advance your current one.',
                    choices: [
                        { text: 'Pursue a better job 📈', effects: { smarts: 5, salary: 15000 }, outcome: '+Career' },
                        { text: 'Stay in current job 👔', effects: { money: 5000 }, outcome: 'Stable' },
                        { text: 'Start your own business 🚀', effects: { money: -10000, smarts: -5, happiness: 20 }, outcome: 'Risky' }
                    ]
                },
                {
                    title: 'Romance',
                    description: 'Someone interesting is interested in you...',
                    choices: [
                        { text: 'Accept and start dating 💕', effects: { happiness: 25, relationshipsList: 'Lover' }, outcome: '+Love' },
                        { text: 'Get married if dating 💍', effects: { happiness: 30, married: true }, outcome: '+Married', condition: 'dating' },
                        { text: 'Focus on work instead 💼', effects: { salary: 5000, happiness: -10 }, outcome: 'Career first' }
                    ]
                },
                {
                    title: 'Life Crisis',
                    description: 'You\'re facing a difficult decision...',
                    choices: [
                        { text: 'Take a vacation to recover 🏖️', effects: { happiness: 25, money: -3000, health: 15 }, outcome: 'Relaxed' },
                        { text: 'Work through it 💪', effects: { health: -10, happiness: 5, money: 5000 }, outcome: 'Grinded' },
                        { text: 'See a therapist 🧠', effects: { happiness: 20, health: 10, money: -2000 }, outcome: 'Helped' }
                    ]
                },
                {
                    title: 'Have a Baby?',
                    description: 'It\'s time to think about expanding your family...',
                    choices: [
                        { text: 'Have a child 👶', effects: { children: 1, happiness: 30, money: -15000 }, outcome: 'Parent now' },
                        { text: 'Not ready yet ⏳', effects: { happiness: 5 }, outcome: 'Later' },
                        { text: 'Don\'t want children 🙅', effects: { happiness: 10 }, outcome: 'Childfree' }
                    ]
                }
            ];
            event = adultEvents[Math.floor(Math.random() * adultEvents.length)];
        } else if (stage === 'elderly' && age >= 65) {
            const elderlyEvents = [
                {
                    title: 'Retirement',
                    description: 'Time to think about retirement...',
                    choices: [
                        { text: 'Retire and enjoy life 🌅', effects: { happiness: 20, health: -5 }, outcome: 'Retired' },
                        { text: 'Work a few more years 💪', effects: { money: 10000, health: -10 }, outcome: 'Still working' },
                        { text: 'Travel the world 🌍', effects: { happiness: 30, money: -20000, health: 10 }, outcome: 'Adventure' }
                    ]
                }
            ];
            event = elderlyEvents[Math.floor(Math.random() * elderlyEvents.length)];
        }

        // Default event if no stage-specific event
        if (!event) {
            event = {
                title: 'Life Moment',
                description: 'Another year passes in your life...',
                choices: [
                    { text: 'Continue on 👉', effects: {}, outcome: 'Onward' }
                ]
            };
        }

        return event;
    }

    makeChoice(index) {
        if (!this.currentEvent || index >= this.currentEvent.choices.length) return;

        const choice = this.currentEvent.choices[index];
        const effects = choice.effects;

        // Apply effects
        if (effects.health) this.character.health = Math.max(0, Math.min(100, this.character.health + effects.health));
        if (effects.happiness) this.character.happiness = Math.max(0, Math.min(100, this.character.happiness + effects.happiness));
        if (effects.smarts) this.character.smarts = Math.max(0, Math.min(100, this.character.smarts + effects.smarts));
        if (effects.looks) this.character.looks = Math.max(0, Math.min(100, this.character.looks + effects.looks));
        if (effects.money) this.character.money = Math.max(0, this.character.money + effects.money);
        if (effects.salary) this.character.salary = Math.max(0, this.character.salary + effects.salary);
        if (effects.relationshipsList) {
            this.character.relationshipsList.push(effects.relationshipsList);
        }
        if (effects.married) this.character.married = true;
        if (effects.children) this.character.children.length = 0; // Simplified

        this.addEvent(`✓ ${choice.text}`, 'info');
        this.nextYear();
    }

    nextYear() {
        this.character.year++;
        this.character.age++;

        // Generate year events
        this.generateYearEvent();

        // Check for game over
        if (this.character.health <= 0 || this.character.age > 120) {
            this.endGame();
            return;
        }

        // Generate next decision event
        this.currentEvent = this.createDecisionEvent();
        this.updateUI();
    }

    endGame() {
        this.gameRunning = false;
        const message = `${this.character.name} lived to be ${this.character.age} years old.\n\nFinal Stats:\nHappiness: ${this.character.happiness}\nWealth: $${Math.floor(this.character.money)}\nChildren: ${this.character.children.length}\n\nWhat a life!`;
        alert(message);
        this.addEvent(`💀 R.I.P. ${this.character.name} (${this.character.age} years old)`, 'negative');
        const choicesContainer = document.getElementById('choicesContainer');
        if (choicesContainer) {
            choicesContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Game Over - Your life has ended. Start a new life in the More tab!</p>';
        }
    }

    initializeGame(name, gender, country, traits) {
        this.character.name = name;
        this.character.gender = gender;
        this.character.country = country;
        
        // Apply starting traits
        if (traits.includes('intelligent')) this.character.smarts = 70;
        if (traits.includes('athletic')) { this.character.looks = 70; this.character.health = 90; }
        if (traits.includes('attractive')) this.character.looks = 80;
        if (traits.includes('wealthy')) this.character.money = 50000;

        this.character.traits = traits;
        this.gameRunning = true;
        this.events = [];
        
        this.addEvent(`👶 ${name} is born in ${country}!`, 'info');
        
        // Create initial decision event
        this.currentEvent = this.createDecisionEvent();
        this.updateUI();
    }

    updateUI() {
        // Header
        document.getElementById('characterNameHeader').textContent = this.character.name;
        document.getElementById('ageValue').textContent = this.character.age;
        
        // Health bar at top
        this.updateStatBar('health', this.character.health, 100, 'TopBar');

        // Life stage badge
        const stage = this.getCurrentStage();
        const stageEmoji = { childhood: '🍼', teen: '👦', adult: '👨', elderly: '👴' };
        const stageName = { childhood: 'Childhood', teen: 'Teenage Years', adult: 'Adulthood', elderly: 'Elderly' };
        document.getElementById('lifeStageBadge').textContent = 
            `${stageEmoji[stage]} ${stageName[stage]}`;

        // LIFE TAB - Main event and choices
        if (this.currentEvent) {
            document.getElementById('eventTitle').textContent = this.currentEvent.title;
            document.getElementById('eventDescription').textContent = this.currentEvent.description;
            
            const choicesContainer = document.getElementById('choicesContainer');
            choicesContainer.innerHTML = this.currentEvent.choices
                .map((choice, index) => `
                    <button class="choice-button" onclick="game.makeChoice(${index})">
                        <span class="choice-text">${choice.text}</span>
                        <span class="choice-arrow">→</span>
                    </button>
                `)
                .join('');
        }

        // SCHOOL TAB
        document.getElementById('educationLevel').textContent = this.character.education;
        document.getElementById('smartsBar').style.width = this.character.smarts + '%';
        document.getElementById('smartsValue').textContent = this.character.smarts;

        // WORK TAB
        document.getElementById('jobName').textContent = this.character.job;
        document.getElementById('salaryAmount').textContent = `$${this.character.salary}/year`;
        document.getElementById('netWorth').textContent = `$${Math.floor(this.character.money)}`;

        // HEALTH TAB
        document.getElementById('healthBarCard').style.width = this.character.health + '%';
        document.getElementById('healthValueCard').textContent = this.character.health;
        document.getElementById('looksBarCard').style.width = this.character.looks + '%';
        document.getElementById('looksValueCard').textContent = this.character.looks;

        // RELATIONSHIPS TAB
        const relationshipsList = document.getElementById('relationshipsList');
        if (this.character.relationshipsList.length > 0) {
            relationshipsList.innerHTML = this.character.relationshipsList
                .map(rel => `<div class="relationship-item">❤️ ${rel}</div>`)
                .join('');
        } else {
            relationshipsList.innerHTML = '<p class="empty-state">No relationships yet. Go make some friends!</p>';
        }
        
        document.getElementById('spouseInfo').textContent = this.character.married ? (this.character.spouse || 'Married') : 'None';
        document.getElementById('childrenCount').textContent = this.character.children.length;

        // STATS TAB - Full stats bars
        document.getElementById('healthFullBar').style.width = this.character.health + '%';
        document.getElementById('healthValue').textContent = `${this.character.health}/100`;
        
        document.getElementById('happinessFullBar').style.width = this.character.happiness + '%';
        document.getElementById('happinessValue').textContent = `${this.character.happiness}/100`;
        
        document.getElementById('smartsFullBar').style.width = this.character.smarts + '%';
        document.getElementById('smartsFullValue').textContent = `${this.character.smarts}/100`;
        
        document.getElementById('looksFullBar').style.width = this.character.looks + '%';
        document.getElementById('looksFullValue').textContent = `${this.character.looks}/100`;

        // Update timeline
        this.updateTimeline();
    }

    updateStatBar(stat, current, max, suffix = '') {
        const percentage = (current / max) * 100;
        const element = document.getElementById(`${stat}${suffix}`);
        if (element) {
            element.style.width = percentage + '%';
        }
    }

    updateTimeline() {
        const timelineList = document.getElementById('timelineList');
        const timelineListLife = document.getElementById('timelineListLife');
        
        const timelineHTML = this.events
            .slice()
            .reverse()
            .slice(0, 20)
            .map(event => `<p class="timeline-item">Age ${event.age}: ${event.text}</p>`)
            .join('');
        
        if (timelineList) {
            timelineList.innerHTML = timelineHTML;
            timelineList.scrollTop = 0;
        }
        
        if (timelineListLife) {
            timelineListLife.innerHTML = timelineHTML;
            timelineListLife.scrollTop = 0;
        }
    }

    doActivity(activity) {
        if (!this.gameRunning) {
            alert('Start a new life first!');
            return;
        }

        const activityMap = {
            // School activities
            'study': {
                title: 'Study Hard',
                smarts: 15,
                happiness: -10,
                message: 'You spent the day studying hard. Your smarts improved!'
            },
            'tutoring': {
                title: 'Get Tutoring',
                smarts: 20,
                money: -500,
                message: 'You hired a tutor. Worth the investment for better smarts!'
            },
            'library': {
                title: 'Visit Library',
                smarts: 10,
                happiness: 5,
                message: 'You spent time at the library. It was both educational and relaxing!'
            },

            // Work activities
            'work_overtime': {
                title: 'Work Overtime',
                money: 2000,
                health: -15,
                message: 'You worked overtime and earned extra money, but it took a toll on your health.'
            },
            'ask_raise': {
                title: 'Ask for Raise',
                salary: 5000,
                happiness: -5,
                message: 'You asked for a raise! Your boss agreed to increase your salary.'
            },
            'side_gig': {
                title: 'Side Gig',
                money: 1500,
                happiness: -10,
                message: 'You took on a side gig and earned some extra cash!'
            },

            // Health activities
            'gym': {
                title: 'Go to Gym',
                health: 20,
                looks: 15,
                message: 'You had a great workout! You feel stronger and look better.'
            },
            'rest': {
                title: 'Get Rest',
                health: 25,
                happiness: 10,
                message: 'You got a good night\'s sleep. You feel refreshed and happy!'
            },
            'doctor': {
                title: 'Visit Doctor',
                health: 30,
                money: -1000,
                message: 'The doctor gave you a checkup. You\'re in better health now!'
            },
            'healthy_eat': {
                title: 'Eat Healthy',
                health: 10,
                money: -500,
                message: 'You bought and ate healthy food. Your body feels better!'
            },
            'spa': {
                title: 'Spa Day',
                looks: 20,
                happiness: 15,
                money: -800,
                message: 'You spent the day at the spa. You look and feel amazing!'
            },
            'haircut': {
                title: 'Get Haircut',
                looks: 15,
                money: -300,
                message: 'Fresh haircut! You look great!'
            },

            // Relationship activities
            'party': {
                title: 'Throw a Party',
                happiness: 20,
                relationships: 3,
                money: -1500,
                message: 'You threw an awesome party! Made some new friends and had a blast!'
            },
            'dating': {
                title: 'Go on Date',
                happiness: 25,
                money: -800,
                message: 'You went on a date! It was amazing!'
            },
            'volunteer': {
                title: 'Volunteer',
                happiness: 15,
                relationships: 2,
                message: 'You volunteered and helped others. It felt great!'
            }
        };

        const act = activityMap[activity];
        if (!act) return;

        // Apply effects
        if (act.health) this.character.health = Math.max(0, Math.min(100, this.character.health + act.health));
        if (act.happiness) this.character.happiness = Math.max(0, Math.min(100, this.character.happiness + act.happiness));
        if (act.smarts) this.character.smarts = Math.max(0, Math.min(100, this.character.smarts + act.smarts));
        if (act.looks) this.character.looks = Math.max(0, Math.min(100, this.character.looks + act.looks));
        if (act.money) this.character.money = Math.max(0, this.character.money + act.money);
        if (act.salary) this.character.salary = Math.max(0, this.character.salary + act.salary);
        if (act.relationships) {
            for (let i = 0; i < act.relationships; i++) {
                this.character.relationshipsList.push('Friend');
            }
        }

        // Add to timeline
        this.addEvent(`✓ ${act.title}`, 'positive');

        // Show feedback
        alert(act.message + '\n\nYear advanced!');

        // Advance time
        this.nextYear();
    }

    saveGame() {
        localStorage.setItem('bitlifeSave', JSON.stringify({
            character: this.character,
            events: this.events,
            currentEvent: this.currentEvent
        }));
        alert('Life saved!');
    }

    loadGame() {
        const save = localStorage.getItem('bitlifeSave');
        if (save) {
            const data = JSON.parse(save);
            this.character = data.character;
            this.events = data.events;
            this.currentEvent = data.currentEvent;
            this.gameRunning = true;
            this.updateUI();
            alert('Life loaded!');
            return true;
        }
        alert('No save file found!');
        return false;
    }
}

// Initialize game
let game = new BitLifeGame();

console.log('Game initialized');

// UI Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    try {
        // ===== TAB NAVIGATION =====
        const activityBtns = document.querySelectorAll('.activity-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        activityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                
                // Remove active from all buttons and tabs
                activityBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(tab => tab.classList.remove('active'));
                
                // Add active to clicked button and corresponding tab
                btn.classList.add('active');
                document.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');
            });
        });

        // Start game button
        const startBtn = document.getElementById('startGameBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                const name = document.getElementById('characterNameInput').value || 'Alex';
                const gender = document.getElementById('genderSelect').value;
                const country = document.getElementById('countrySelect').value;
                
                const traits = Array.from(document.querySelectorAll('.trait-check:checked'))
                    .map(el => el.value);
                
                game.initializeGame(name, gender, country, traits);
                document.getElementById('startModal').classList.remove('show');
            });
        }

        // Age button - show character info
        const ageButton = document.getElementById('ageButton');
        if (ageButton) {
            ageButton.addEventListener('click', () => {
                const info = `${game.character.name}\nAge: ${game.character.age}\nYear: ${game.character.year}`;
                alert(info);
            });
        }

        // Save/Load
        const saveBtn = document.getElementById('saveGameBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                game.saveGame();
            });
        }

        const loadBtn = document.getElementById('loadGameBtn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                if (game.loadGame()) {
                    // Already loaded
                }
            });
        }

        // New game
        const newGameBtn = document.getElementById('newGameBtn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                if (confirm('Start a new life? Current progress will be lost unless saved.')) {
                    game = new BitLifeGame();
                    document.getElementById('startModal').classList.add('show');
                }
            });
        }

        // Settings
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                document.getElementById('settingsModal').classList.add('show');
            });
        }

        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => {
                document.getElementById('settingsModal').classList.remove('show');
            });
        }

        // Close modals on background click
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.classList.remove('show');
            }
        });

        // Show start modal
        const startModal = document.getElementById('startModal');
        if (startModal) {
            startModal.classList.add('show');
            console.log('✓ Start modal shown');
        } else {
            console.error('startModal not found');
        }
    } catch (error) {
        console.error('Game initialization error:', error);
        console.error('Full error:', error.stack);
        alert('Error loading game: ' + error.message);
    }
});
