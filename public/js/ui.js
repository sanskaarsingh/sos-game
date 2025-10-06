// Additional UI enhancements and animations
class UIEnhancements {
    constructor() {
        this.initializeAnimations();
        this.initializeSmoothTransitions();
    }

    initializeAnimations() {
        // Add hover effects to interactive elements
        this.addHoverEffects();
        
        // Initialize loading states
        this.initializeLoadingStates();
        
        // Add keyboard navigation
        this.initializeKeyboardNavigation();
    }

    addHoverEffects() {
        // Add subtle hover effects to cards and buttons
        const interactiveElements = document.querySelectorAll('.btn, .cell, .player-card, .player-item');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-2px)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translateY(0)';
            });
        });
    }

    initializeLoadingStates() {
        // Add loading states to buttons when performing actions
        const actionButtons = document.querySelectorAll('#startGameBtn, #createGameBtn, #joinGameBtn');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const originalText = button.textContent;
                button.innerHTML = '<div class="loading-spinner small"></div> Loading...';
                button.disabled = true;
                
                // Revert after 3 seconds if still loading
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 3000);
            });
        });
    }

    initializeKeyboardNavigation() {
        // Add keyboard support for the game
        document.addEventListener('keydown', (e) => {
            // Letter selection with keyboard
            if (e.key === 's' || e.key === 'S') {
                this.selectLetter('S');
            } else if (e.key === 'o' || e.key === 'O') {
                this.selectLetter('O');
            }
            
            // Escape key to leave game
            if (e.key === 'Escape') {
                const leaveBtn = document.querySelector('#leaveGame, #leaveLobby');
                if (leaveBtn) leaveBtn.click();
            }
        });
    }

    selectLetter(letter) {
        const letterBtn = document.querySelector(`.letter-btn[data-letter="${letter}"]`);
        if (letterBtn && !letterBtn.disabled) {
            letterBtn.click();
            
            // Add visual feedback
            letterBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                letterBtn.style.transform = 'scale(1.1)';
            }, 150);
        }
    }

    initializeSmoothTransitions() {
        // Add smooth page transitions
        this.addPageTransitions();
        
        // Initialize parallax effects
        this.addParallaxEffects();
    }

    addPageTransitions() {
        // Add fade transitions between screens
        const style = document.createElement('style');
        style.textContent = `
            .screen {
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            .screen:not(.active) {
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    addParallaxEffects() {
        // Simple parallax effect for background
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.container');
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
        });
    }

    // Utility function to create confetti effect
    createConfetti() {
        const confettiCount = 100;
        const colors = ['#ff6b35', '#ff8c5a', '#ffffff', '#2d2d2d'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}vw;
                opacity: ${Math.random() + 0.5};
                transform: rotate(${Math.random() * 360}deg);
                pointer-events: none;
                z-index: 1000;
            `;
            
            document.body.appendChild(confetti);
            
            // Animate confetti
            const animation = confetti.animate([
                { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
                { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 3000 + 2000,
                easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
            });
            
            animation.onfinish = () => confetti.remove();
        }
    }
}

// Initialize UI enhancements
document.addEventListener('DOMContentLoaded', () => {
    new UIEnhancements();
});