// Main JavaScript functionality for Brizitrix Coming Soon page

// Configuration
const CONFIG = {
    // Set launch date (you can modify this date)
    launchDate: new Date('2025-12-31T23:59:59'),
    
    // Visitor tracking keys
    visitorCountKey: 'brizitrix-visitor-count',
    currentVisitorKey: 'brizitrix-current-visitor',
    lastVisitKey: 'brizitrix-last-visit',
    
    // Newsletter subscribers key
    subscribersKey: 'brizitrix-subscribers',
    
    // Default visitor count (starts at 250)
    defaultVisitorCount: 250
};

// DOM elements
const elements = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    visitorCount: document.getElementById('visitor-count'),
    currentVisitor: document.getElementById('current-visitor'),
    emailInput: document.getElementById('email'),
    newsletterMessage: document.getElementById('newsletter-message')
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeVisitorTracking();
    startCountdown();
    initializeNewsletter();
    addScrollEffects();
    handleFormValidation();
});

// Visitor Tracking System
function initializeVisitorTracking() {
    try {
        const now = Date.now();
        const lastVisit = localStorage.getItem(CONFIG.lastVisitKey);
        const currentSession = sessionStorage.getItem('current-session');
        
        // Check if this is a new visit (different day or no previous visit)
        const isNewVisit = !lastVisit || 
                          (new Date(parseInt(lastVisit)).toDateString() !== new Date().toDateString()) ||
                          !currentSession;
        
        // Start with default count if no previous visitors recorded
        let totalVisitors = parseInt(localStorage.getItem(CONFIG.visitorCountKey)) || CONFIG.defaultVisitorCount;
        let currentVisitorNumber = parseInt(localStorage.getItem(CONFIG.currentVisitorKey)) || CONFIG.defaultVisitorCount;
        
        if (isNewVisit) {
            totalVisitors += 1;
            currentVisitorNumber = totalVisitors;
            
            // Update localStorage
            localStorage.setItem(CONFIG.visitorCountKey, totalVisitors);
            localStorage.setItem(CONFIG.currentVisitorKey, currentVisitorNumber);
            localStorage.setItem(CONFIG.lastVisitKey, now.toString());
            
            // Mark current session
            sessionStorage.setItem('current-session', 'active');
        } else {
            // Return visitor - get their original visitor number
            currentVisitorNumber = parseInt(localStorage.getItem(CONFIG.currentVisitorKey)) || totalVisitors;
        }
        
        // Update display
        updateVisitorDisplay(totalVisitors, currentVisitorNumber);
        
        // Log visit for analytics (you can extend this)
        logVisit(currentVisitorNumber, isNewVisit);
        
    } catch (error) {
        console.error('Error initializing visitor tracking:', error);
        // Fallback display with default count
        updateVisitorDisplay(CONFIG.defaultVisitorCount, CONFIG.defaultVisitorCount);
    }
}

function updateVisitorDisplay(total, current) {
    if (elements.visitorCount) {
        elements.visitorCount.textContent = total.toLocaleString();
        animateNumber(elements.visitorCount, total);
    }
    
    if (elements.currentVisitor) {
        elements.currentVisitor.textContent = current.toLocaleString();
        animateNumber(elements.currentVisitor, current);
    }
}

function animateNumber(element, finalNumber) {
    const startNumber = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentNumber = Math.floor(startNumber + (finalNumber - startNumber) * easeOutCubic);
        
        element.textContent = currentNumber.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function logVisit(visitorNumber, isNewVisit) {
    const visitData = {
        visitorNumber: visitorNumber,
        isNewVisit: isNewVisit,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'Direct',
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language
    };
    
    // Store visit log (you can extend this to send to analytics service)
    const visitLog = JSON.parse(localStorage.getItem('brizitrix-visit-log') || '[]');
    visitLog.push(visitData);
    
    // Keep only last 100 visits to manage storage
    if (visitLog.length > 100) {
        visitLog.splice(0, visitLog.length - 100);
    }
    
    localStorage.setItem('brizitrix-visit-log', JSON.stringify(visitLog));
    
    // Console log for development
    console.log('Visit logged:', visitData);
}

// Countdown Timer System
function startCountdown() {
    updateCountdown(); // Initial update
    
    // Update every second
    const countdownInterval = setInterval(function() {
        updateCountdown();
        
        // Check if countdown has ended
        const now = new Date().getTime();
        const distance = CONFIG.launchDate.getTime() - now;
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            handleLaunchComplete();
        }
    }, 1000);
}

function updateCountdown() {
    const now = new Date().getTime();
    const distance = CONFIG.launchDate.getTime() - now;
    
    if (distance < 0) {
        handleLaunchComplete();
        return;
    }
    
    // Calculate time units
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Update display with animation
    updateTimeDisplay(elements.days, days);
    updateTimeDisplay(elements.hours, hours);
    updateTimeDisplay(elements.minutes, minutes);
    updateTimeDisplay(elements.seconds, seconds);
}

function updateTimeDisplay(element, value) {
    if (!element) return;
    
    const formattedValue = value.toString().padStart(2, '0');
    
    if (element.textContent !== formattedValue) {
        element.style.transform = 'scale(1.1)';
        element.textContent = formattedValue;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
}

function handleLaunchComplete() {
    // Replace countdown with launch message
    const countdownContainer = document.querySelector('.countdown-container');
    if (countdownContainer) {
        countdownContainer.innerHTML = `
            <div class="launch-complete">
                <h3>🎉 We're Live! 🎉</h3>
                <p>Thank you for your patience. Brizitrix is now available!</p>
                <button onclick="window.location.reload()" class="refresh-btn">
                    Explore Now
                </button>
            </div>
        `;
    }
}

// Newsletter System
function initializeNewsletter() {
    const emailInput = elements.emailInput;
    
    if (emailInput) {
        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                subscribeNewsletter();
            }
        });
    }
}

function subscribeNewsletter() {
    const email = elements.emailInput.value.trim();
    const messageElement = elements.newsletterMessage;
    
    // Validate email
    if (!isValidEmail(email)) {
        showMessage(messageElement, 'Please enter a valid email address.', 'error');
        return;
    }
    
    try {
        // Get existing subscribers
        const subscribers = JSON.parse(localStorage.getItem(CONFIG.subscribersKey) || '[]');
        
        // Check if already subscribed
        if (subscribers.some(sub => sub.email.toLowerCase() === email.toLowerCase())) {
            showMessage(messageElement, 'You\'re already subscribed! Thanks for your interest.', 'success');
            return;
        }
        
        // Add new subscriber
        const subscriber = {
            email: email,
            timestamp: new Date().toISOString(),
            visitorNumber: parseInt(localStorage.getItem(CONFIG.currentVisitorKey)) || 1
        };
        
        subscribers.push(subscriber);
        localStorage.setItem(CONFIG.subscribersKey, JSON.stringify(subscribers));
        
        // Clear input and show success message
        elements.emailInput.value = '';
        showMessage(messageElement, `Thank you! You'll be notified when we launch. (${subscribers.length} subscribers)`, 'success');
        
        // Add celebration effect
        triggerCelebration();
        
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        showMessage(messageElement, 'Something went wrong. Please try again later.', 'error');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showMessage(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `newsletter-message ${type}`;
    
    // Hide message after 5 seconds
    setTimeout(() => {
        element.textContent = '';
        element.className = 'newsletter-message';
    }, 5000);
}

function triggerCelebration() {
    // Create celebration particles
    for (let i = 0; i < 20; i++) {
        createParticle();
    }
}

function createParticle() {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: #ff6b6b;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: 50%;
        top: 60%;
    `;
    
    document.body.appendChild(particle);
    
    // Animate particle
    const angle = Math.random() * 360;
    const distance = Math.random() * 200 + 100;
    const duration = Math.random() * 2000 + 1000;
    
    const deltaX = Math.cos(angle * Math.PI / 180) * distance;
    const deltaY = Math.sin(angle * Math.PI / 180) * distance;
    
    particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${deltaX}px, ${deltaY}px) scale(0)`, opacity: 0 }
    ], {
        duration: duration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => {
        particle.remove();
    };
}

// Additional UI Effects
function addScrollEffects() {
    // Add parallax effect to floating circles
    window.addEventListener('scroll', function() {
        const circles = document.querySelectorAll('.floating-circle');
        const scrollY = window.scrollY;
        
        circles.forEach((circle, index) => {
            const speed = 0.5 + (index * 0.1);
            circle.style.transform = `translateY(${scrollY * speed}px) rotate(${scrollY * 0.1}deg)`;
        });
    });
}

function handleFormValidation() {
    const emailInput = elements.emailInput;
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const email = this.value.trim();
            
            if (email.length > 0) {
                if (isValidEmail(email)) {
                    this.style.borderColor = 'rgba(39, 174, 96, 0.5)';
                    this.style.background = 'rgba(39, 174, 96, 0.1)';
                } else {
                    this.style.borderColor = 'rgba(231, 76, 60, 0.5)';
                    this.style.background = 'rgba(231, 76, 60, 0.1)';
                }
            } else {
                this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                this.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        });
    }
}

// Utility Functions
function getVisitorStats() {
    return {
        totalVisitors: parseInt(localStorage.getItem(CONFIG.visitorCountKey)) || 0,
        currentVisitor: parseInt(localStorage.getItem(CONFIG.currentVisitorKey)) || 0,
        subscribers: JSON.parse(localStorage.getItem(CONFIG.subscribersKey) || '[]').length,
        visitLog: JSON.parse(localStorage.getItem('brizitrix-visit-log') || '[]')
    };
}

// Export stats function for potential analytics integration
window.getBrizitrixStats = getVisitorStats;

// Handle page visibility changes (pause/resume countdown when tab is hidden/visible)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page hidden - countdown continues in background');
    } else {
        console.log('Page visible - ensuring countdown accuracy');
        updateCountdown(); // Ensure accuracy when returning to tab
    }
});

// Performance optimization: Lazy load heavy animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '50px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

// Observe animated elements
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.floating-circle, .time-unit');
    animatedElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
});

// Console welcome message
console.log(`
🚀 Welcome to Brizitrix Coming Soon Page!
📊 Current stats: ${JSON.stringify(getVisitorStats(), null, 2)}
💡 Built with modern web technologies
🎯 Launch date: ${CONFIG.launchDate.toLocaleDateString()}
`);

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could send to error tracking service
});

// Handle offline/online status
window.addEventListener('online', function() {
    console.log('Connection restored');
});

window.addEventListener('offline', function() {
    console.log('Connection lost - countdown continues offline');
});