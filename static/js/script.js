// ============================================
// PIGEON PEA LEAF DISEASE DETECTION
// Frontend JavaScript
// ============================================

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const fileInfo = document.getElementById('fileInfo');
const removeBtn = document.getElementById('removeBtn');
const detectBtn = document.getElementById('detectBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const loadingSubtext = document.getElementById('loadingSubtext');
const progressBar = document.getElementById('progressBar');
const resultsSection = document.getElementById('results-section');
const resetBtn = document.getElementById('resetBtn');
const invalidOverlay = document.getElementById('invalidOverlay');
const tryAgainBtn = document.getElementById('tryAgainBtn');

// Chart instance
let probabilityChart = null;

// ============================================
// DRAG AND DROP
// ============================================
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    uploadArea.classList.add('drag-over');
}

function unhighlight() {
    uploadArea.classList.remove('drag-over');
}

uploadArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

uploadArea.addEventListener('click', () => {
    if (!previewContainer.style.display || previewContainer.style.display === 'none') {
        fileInput.click();
    }
});

fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

// ============================================
// FILE HANDLING
// ============================================
function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please upload a valid image file (JPG, PNG, JPEG, WebP)');
        return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        
        // Format file size
        const size = (file.size / 1024).toFixed(1);
        const sizeUnit = size > 1024 ? 'MB' : 'KB';
        const formattedSize = size > 1024 ? (size / 1024).toFixed(1) : size;
        
        fileInfo.innerHTML = `
            <span><i class="fas fa-file-image"></i> ${file.name}</span>
            <span><i class="fas fa-weight-hanging"></i> ${formattedSize} ${sizeUnit}</span>
        `;
        
        previewContainer.style.display = 'block';
        uploadArea.style.display = 'none';
        
        // Scroll to preview
        previewContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    reader.readAsDataURL(file);
}

// Remove image
removeBtn.addEventListener('click', function() {
    previewImage.src = '';
    fileInput.value = '';
    previewContainer.style.display = 'none';
    uploadArea.style.display = 'block';
    resultsSection.style.display = 'none';
});

// ============================================
// PREDICTION
// ============================================
detectBtn.addEventListener('click', async function() {
    if (!previewImage.src) {
        showError('Please upload an image first');
        return;
    }
    
    // Show loading with validation step
    showLoading();
    loadingText.textContent = 'Validating Leaf...';
    loadingSubtext.textContent = 'Checking if the image is a pigeon pea leaf';
    
    // Animate progress bar
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressBar.style.width = progress + '%';
    }, 200);
    
    try {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        progressBar.style.width = '100%';
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Prediction failed');
        }
        
        const data = await response.json();
        
        // Check if image is invalid
        if (data.invalid_image) {
            // Small delay for smooth UX
            await new Promise(resolve => setTimeout(resolve, 500));
            hideLoading();
            showInvalidImage(data);
            return;
        }
        
        // Small delay for smooth UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        hideLoading();
        displayResults(data);
        
    } catch (error) {
        clearInterval(progressInterval);
        hideLoading();
        showError('Error: ' + error.message);
        console.error('Prediction error:', error);
    }
});

// ============================================
// LOADING
// ============================================
function showLoading() {
    loadingOverlay.style.display = 'flex';
    progressBar.style.width = '0%';
    document.body.style.overflow = 'hidden';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
    loadingText.textContent = 'Analyzing Leaf...';
    loadingSubtext.textContent = 'Our AI model is examining your pigeon pea leaf';
}

// ============================================
// INVALID IMAGE
// ============================================
function showInvalidImage(data) {
    invalidOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    invalidOverlay.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideInvalidImage() {
    invalidOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ============================================
// RESULTS DISPLAY
// ============================================
function displayResults(data) {
    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Update image
    document.getElementById('resultImage').src = 'data:image/png;base64,' + data.image_base64;
    
    // Update disease info
    const diseaseIcon = document.getElementById('diseaseIcon');
    diseaseIcon.innerHTML = `<i class="fas ${data.icon}"></i>`;
    diseaseIcon.style.background = `${data.color}20`;
    diseaseIcon.style.color = data.color;
    
    document.getElementById('diseaseName').textContent = data.predicted_class.replace('_', ' ');
    document.getElementById('diseaseName').style.color = data.color;
    
    const confidenceValue = document.getElementById('confidenceValue');
    confidenceValue.textContent = data.confidence + '%';
    
    const confidenceBadge = document.getElementById('confidenceBadge');
    confidenceBadge.style.background = `linear-gradient(135deg, ${data.color}, ${data.color}dd)`;
    
    // Severity
    const severityValue = document.getElementById('severityValue');
    severityValue.textContent = data.severity;
    severityValue.style.color = data.color;
    
    const severityDisplay = document.getElementById('severityDisplay');
    severityDisplay.querySelector('.severity-icon').style.background = `${data.color}20`;
    severityDisplay.querySelector('.severity-icon').style.color = data.color;
    severityDisplay.querySelector('.severity-icon i').className = data.icon;
    
    // Confidence meter
    const meterFill = document.getElementById('meterFill');
    const meterPercentage = document.getElementById('meterPercentage');
    setTimeout(() => {
        meterFill.style.width = data.confidence + '%';
        meterPercentage.textContent = data.confidence + '%';
    }, 500);
    
    // Description
    document.getElementById('descriptionText').textContent = data.description;
    
    // Causes
    const causesList = document.getElementById('causesList');
    const causes = data.causes.split(', ');
    causesList.innerHTML = causes.map(cause => `<li>${cause}</li>`).join('');
    
    // Organic treatment
    document.getElementById('organicText').textContent = data.organic_treatment;
    
    // Chemical treatment
    document.getElementById('chemicalText').textContent = data.chemical_treatment;
    
    // Prevention
    const preventionList = document.getElementById('preventionList');
    const preventions = data.prevention.split(', ');
    preventionList.innerHTML = preventions.map(prevention => `<li>${prevention}</li>`).join('');
    
    // Probability Chart
    createProbabilityChart(data.probabilities, data.color);
}

// ============================================
// CHART.JS PROBABILITY CHART
// ============================================
function createProbabilityChart(probabilities, accentColor) {
    const ctx = document.getElementById('probabilityChart').getContext('2d');
    
    // Destroy existing chart if any
    if (probabilityChart) {
        probabilityChart.destroy();
    }
    
    const labels = probabilities.map(p => p.class.replace('_', ' '));
    const values = probabilities.map(p => p.percentage);
    const colors = probabilities.map(p => {
        if (p.percentage > 50) return accentColor;
        if (p.percentage > 30) return '#f59e0b';
        return 'rgba(74, 222, 128, 0.4)';
    });
    
    probabilityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Probability (%)',
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.4', '1')),
                borderWidth: 2,
                borderRadius: 12,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 31, 23, 0.9)',
                    titleColor: '#4ade80',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(74, 222, 128, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toFixed(2) + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            weight: '600'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ============================================
// RESET
// ============================================
resetBtn.addEventListener('click', function() {
    resetAll();
});

tryAgainBtn.addEventListener('click', function() {
    hideInvalidImage();
    resetAll();
});

function resetAll() {
    // Reset upload area
    previewImage.src = '';
    fileInput.value = '';
    previewContainer.style.display = 'none';
    uploadArea.style.display = 'block';
    
    // Hide results and invalid overlay
    resultsSection.style.display = 'none';
    hideInvalidImage();
    
    // Reset meter
    document.getElementById('meterFill').style.width = '0%';
    document.getElementById('meterPercentage').textContent = '0%';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// ERROR HANDLING
// ============================================
function showError(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    // Insert after upload card
    const uploadCard = document.querySelector('.upload-card');
    uploadCard.insertBefore(errorDiv, uploadCard.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.opacity = '0';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// ============================================
// SMOOTH SCROLL FOR NAV LINKS
// ============================================
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================
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

// Observe elements
document.querySelectorAll('.glass-card, .about-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});
