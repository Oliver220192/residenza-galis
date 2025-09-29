// Residenza Galis App JavaScript

// Application data
const appData = {
    prices: {
        turisti_weekend: 85,
        insegnanti: 55,
        degenti: 65,
        business: 75
    },
    discounts: {
        soggiorno_7_giorni: 10,
        soggiorno_30_giorni: 20
    }
};

// Calendar state
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDates = {
    checkin: null,
    checkout: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupCalendar();
    setupForms();
    setupDateInputs();
    setupPricingCalculation();
}

// Navigation functionality
function setupNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling
            
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                // Close any open modals first
                closeModal();
                
                // Scroll to target
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            }
        });
    });

    // Prevent any button clicks from interfering with navigation
    document.addEventListener('click', function(e) {
        // Don't interfere with navigation links
        if (e.target.matches('a[href^="#"]')) {
            return;
        }
        
        // Close modal when clicking outside
        const modal = document.getElementById('message-modal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Calendar functionality
function setupCalendar() {
    renderCalendar();
    
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }
}

function renderCalendar() {
    const monthNames = [
        "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];
    
    const dayNames = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
    
    const currentMonthEl = document.getElementById('current-month');
    if (currentMonthEl) {
        currentMonthEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;
    
    calendarGrid.innerHTML = '';
    
    // Add day headers
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('calendar-day', 'header');
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day');
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;
        
        const currentDate = new Date(currentYear, currentMonth, day);
        
        // Disable past dates
        if (currentDate < today.setHours(0, 0, 0, 0)) {
            dayElement.classList.add('occupied');
        } else {
            dayElement.classList.add('available');
            dayElement.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                selectDate(currentYear, currentMonth, day);
            });
        }
        
        // Highlight selected dates
        if (selectedDates.checkin && 
            selectedDates.checkin.getFullYear() === currentYear &&
            selectedDates.checkin.getMonth() === currentMonth &&
            selectedDates.checkin.getDate() === day) {
            dayElement.classList.add('selected');
        }
        
        if (selectedDates.checkout && 
            selectedDates.checkout.getFullYear() === currentYear &&
            selectedDates.checkout.getMonth() === currentMonth &&
            selectedDates.checkout.getDate() === day) {
            dayElement.classList.add('selected');
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function selectDate(year, month, day) {
    const selectedDate = new Date(year, month, day);
    
    if (!selectedDates.checkin || selectedDates.checkout) {
        // Select check-in date
        selectedDates.checkin = selectedDate;
        selectedDates.checkout = null;
    } else if (selectedDate > selectedDates.checkin) {
        // Select check-out date
        selectedDates.checkout = selectedDate;
    } else {
        // If selected date is before check-in, make it the new check-in
        selectedDates.checkin = selectedDate;
        selectedDates.checkout = null;
    }
    
    updateBookingForm();
    renderCalendar();
    calculatePricing();
}

function updateBookingForm() {
    const checkinInput = document.getElementById('booking-checkin');
    const checkoutInput = document.getElementById('booking-checkout');
    
    if (checkinInput && selectedDates.checkin) {
        checkinInput.value = formatDateForInput(selectedDates.checkin);
    }
    
    if (checkoutInput && selectedDates.checkout) {
        checkoutInput.value = formatDateForInput(selectedDates.checkout);
    }
}

function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

// Date input setup
function setupDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    
    // Set minimum date to today
    const dateInputs = [
        'quick-checkin', 'quick-checkout', 
        'booking-checkin', 'booking-checkout'
    ];
    
    dateInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.min = today;
        }
    });
    
    // Sync booking form dates with calendar
    const checkinInput = document.getElementById('booking-checkin');
    const checkoutInput = document.getElementById('booking-checkout');
    
    if (checkinInput) {
        checkinInput.addEventListener('change', function() {
            if (this.value) {
                selectedDates.checkin = new Date(this.value);
                renderCalendar();
                calculatePricing();
            }
        });
    }
    
    if (checkoutInput) {
        checkoutInput.addEventListener('change', function() {
            if (this.value) {
                selectedDates.checkout = new Date(this.value);
                renderCalendar();
                calculatePricing();
            }
        });
    }
}

// Pricing calculation
function setupPricingCalculation() {
    const targetTypeSelect = document.getElementById('target-type');
    if (targetTypeSelect) {
        targetTypeSelect.addEventListener('change', calculatePricing);
    }
}

function calculatePricing() {
    const targetTypeSelect = document.getElementById('target-type');
    const pricingContainer = document.getElementById('pricing-summary');
    
    if (!targetTypeSelect || !pricingContainer) return;
    
    if (!selectedDates.checkin || !selectedDates.checkout) {
        pricingContainer.style.display = 'none';
        return;
    }
    
    const targetType = targetTypeSelect.value;
    const nights = Math.ceil((selectedDates.checkout - selectedDates.checkin) / (1000 * 60 * 60 * 24));
    const pricePerNight = appData.prices[targetType];
    const subtotal = nights * pricePerNight;
    
    // Calculate discounts
    let discount = 0;
    let discountText = '';
    
    if (nights >= 30) {
        discount = subtotal * (appData.discounts.soggiorno_30_giorni / 100);
        discountText = 'Sconto soggiorno lungo (30+ giorni): -20%';
    } else if (nights >= 7) {
        discount = subtotal * (appData.discounts.soggiorno_7_giorni / 100);
        discountText = 'Sconto soggiorno lungo (7+ giorni): -10%';
    }
    
    const total = subtotal - discount;
    
    // Update pricing display
    const pricePerNightEl = document.getElementById('price-per-night');
    const totalNightsEl = document.getElementById('total-nights');
    const subtotalEl = document.getElementById('subtotal');
    const totalPriceEl = document.getElementById('total-price');
    const discountRow = document.getElementById('discount-row');
    const discountTextEl = document.getElementById('discount-text');
    const discountAmountEl = document.getElementById('discount-amount');
    
    if (pricePerNightEl) pricePerNightEl.textContent = `€${pricePerNight}`;
    if (totalNightsEl) totalNightsEl.textContent = nights;
    if (subtotalEl) subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
    if (totalPriceEl) totalPriceEl.textContent = `€${total.toFixed(2)}`;
    
    if (discountRow && discountTextEl && discountAmountEl) {
        if (discount > 0) {
            discountTextEl.textContent = discountText;
            discountAmountEl.textContent = `-€${discount.toFixed(2)}`;
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }
    }
    
    pricingContainer.style.display = 'block';
}

function updatePricing() {
    calculatePricing();
}

// Form handling
function setupForms() {
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactForm();
        });
    }
}

function handleContactForm() {
    const nameEl = document.getElementById('contact-name');
    const emailEl = document.getElementById('contact-email');
    const messageEl = document.getElementById('contact-message');
    
    if (!nameEl || !emailEl || !messageEl) {
        showModal('Errore', 'Impossibile trovare i campi del form.');
        return;
    }
    
    const name = nameEl.value;
    const email = emailEl.value;
    const message = messageEl.value;
    
    if (!name || !email || !message) {
        showModal('Errore', 'Per favore compila tutti i campi obbligatori.');
        return;
    }
    
    // Simulate form submission
    showModal('Messaggio Inviato', 'Grazie per averci contattato! Ti risponderemo al più presto.');
    
    // Reset form
    contactForm.reset();
}

// Booking functionality
function quickSearch() {
    const checkinEl = document.getElementById('quick-checkin');
    const checkoutEl = document.getElementById('quick-checkout');
    const guestsEl = document.getElementById('quick-guests');
    
    if (!checkinEl || !checkoutEl || !guestsEl) {
        showModal('Errore', 'Impossibile trovare i campi di ricerca.');
        return;
    }
    
    const checkin = checkinEl.value;
    const checkout = checkoutEl.value;
    const guests = guestsEl.value;
    
    if (!checkin || !checkout) {
        showModal('Date Mancanti', 'Per favore seleziona le date di check-in e check-out.');
        return;
    }
    
    if (new Date(checkin) >= new Date(checkout)) {
        showModal('Date Non Valide', 'La data di check-out deve essere successiva al check-in.');
        return;
    }
    
    // Scroll to booking section
    scrollToBooking();
    
    // Pre-fill booking form
    selectedDates.checkin = new Date(checkin);
    selectedDates.checkout = new Date(checkout);
    
    const bookingGuestsEl = document.getElementById('booking-guests');
    if (bookingGuestsEl) {
        bookingGuestsEl.value = guests;
    }
    
    updateBookingForm();
    renderCalendar();
    calculatePricing();
    
    showModal('Disponibilità Confermata', 'Le date selezionate sono disponibili! Completa la prenotazione qui sotto.');
}

function scrollToBooking() {
    const bookingSection = document.getElementById('prenotazioni');
    if (bookingSection) {
        bookingSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function submitBooking() {
    // Validate booking form
    const requiredFields = [
        { id: 'guest-name', label: 'Nome e Cognome' },
        { id: 'guest-email', label: 'Email' },
        { id: 'guest-phone', label: 'Telefono' }
    ];
    
    const missingFields = [];
    
    requiredFields.forEach(field => {
        const fieldEl = document.getElementById(field.id);
        if (!fieldEl || !fieldEl.value.trim()) {
            missingFields.push(field.label);
        }
    });
    
    if (!selectedDates.checkin || !selectedDates.checkout) {
        missingFields.push('Date di soggiorno');
    }
    
    if (missingFields.length > 0) {
        showModal('Campi Mancanti', `Per favore compila i seguenti campi: ${missingFields.join(', ')}`);
        return;
    }
    
    // Validate email
    const emailEl = document.getElementById('guest-email');
    const email = emailEl ? emailEl.value : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showModal('Email Non Valida', 'Per favore inserisci un indirizzo email valido.');
        return;
    }
    
    // Simulate booking submission
    const guestNameEl = document.getElementById('guest-name');
    const totalPriceEl = document.getElementById('total-price');
    const guestName = guestNameEl ? guestNameEl.value : '';
    const totalPrice = totalPriceEl ? totalPriceEl.textContent : '€0';
    
    showModal(
        'Prenotazione Inviata!', 
        `Grazie ${guestName}! La tua richiesta di prenotazione è stata inviata. Ti contatteremo entro 24 ore per confermare la disponibilità e finalizzare la prenotazione. Totale stimato: ${totalPrice}`
    );
    
    // Reset form
    resetBookingForm();
}

function resetBookingForm() {
    selectedDates = { checkin: null, checkout: null };
    
    const elements = [
        'booking-checkin', 'booking-checkout', 'guest-name', 
        'guest-email', 'guest-phone', 'special-notes'
    ];
    
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    const pricingSummary = document.getElementById('pricing-summary');
    if (pricingSummary) {
        pricingSummary.style.display = 'none';
    }
    
    renderCalendar();
}

// FAQ functionality
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Toggle current item
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// WhatsApp functionality
function openWhatsApp() {
    const phoneNumber = "+39XXXXXXXXX"; // Replace with actual number
    const message = "Ciao! Vorrei informazioni sulla Residenza Galis.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Modal functionality
function showModal(title, text) {
    const titleEl = document.getElementById('message-title');
    const textEl = document.getElementById('message-text');
    const modal = document.getElementById('message-modal');
    
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
    if (modal) modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('message-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Utility functions
function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('it-IT', options);
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Intersection Observer for animations (optional enhancement)
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    const elementsToAnimate = document.querySelectorAll('.card, .detail-item, .scuola-categoria');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all elements are rendered
    setTimeout(setupScrollAnimations, 100);
});

// Handle window resize
window.addEventListener('resize', function() {
    // Re-render calendar if needed
    renderCalendar();
});

// Prevent form submission on Enter key for date inputs
document.addEventListener('keypress', function(e) {
    if (e.target.type === 'date' && e.key === 'Enter') {
        e.preventDefault();
    }
});

// Add smooth scrolling behavior for better UX
document.documentElement.style.scrollBehavior = 'smooth';