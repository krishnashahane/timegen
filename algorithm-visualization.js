// AI Algorithm Visualization Module
// This module provides visual representation of the timetable generation algorithm

class AlgorithmVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.data = {
            constraints: [],
            iterations: [],
            solutions: []
        };
        this.animationFrame = null;
        this.currentStep = 0;
        this.maxSteps = 100;
        this.initialized = false;
    }

    initialize() {
        if (!this.container) return false;
        
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        
        // Set dimensions
        this.resize();
        
        // Get context
        this.ctx = this.canvas.getContext('2d');
        
        // Add resize listener
        window.addEventListener('resize', () => this.resize());
        
        this.initialized = true;
        return true;
    }
    
    resize() {
        if (!this.canvas) return;
        
        const containerRect = this.container.getBoundingClientRect();
        this.width = containerRect.width;
        this.height = 300; // Fixed height
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Redraw if we have data
        if (this.data.iterations.length > 0) {
            this.draw();
        }
    }
    
    setData(algorithmData) {
        this.data = algorithmData;
        this.maxSteps = this.data.iterations.length;
        this.currentStep = 0;
    }
    
    generateDemoData() {
        // Generate sample data for demonstration
        const iterations = [];
        const constraints = [
            { type: 'faculty', weight: 0.8 },
            { type: 'room', weight: 0.6 },
            { type: 'student', weight: 0.9 },
            { type: 'time', weight: 0.7 }
        ];
        
        // Generate iterations with improving fitness scores
        let fitness = 0.3;
        for (let i = 0; i < 100; i++) {
            // Add some randomness to the fitness progression
            fitness += (Math.random() * 0.03);
            if (fitness > 0.99) fitness = 0.99;
            
            // Add some local optima and exploration phases
            if (i % 20 === 0 && i > 0) fitness -= 0.15;
            
            iterations.push({
                iteration: i,
                fitness: fitness,
                conflicts: Math.max(0, Math.floor((1 - fitness) * 20)),
                temperature: Math.max(0.01, 1 - (i / 100))
            });
        }
        
        // Final solution
        const solution = {
            fitness: 0.98,
            conflicts: 0,
            executionTime: '3.2 seconds',
            constraintSatisfaction: {
                faculty: 0.96,
                room: 0.99,
                student: 0.97,
                time: 0.99
            }
        };
        
        this.data = {
            constraints,
            iterations,
            solution
        };
        
        this.maxSteps = iterations.length;
    }
    
    start() {
        if (!this.initialized) {
            if (!this.initialize()) return;
        }
        
        // Generate demo data if none provided
        if (this.data.iterations.length === 0) {
            this.generateDemoData();
        }
        
        // Start animation
        this.animate();
    }
    
    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    animate() {
        this.draw();
        
        this.currentStep++;
        if (this.currentStep >= this.maxSteps) {
            this.currentStep = this.maxSteps - 1;
            this.drawFinalState();
            return;
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    draw() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw fitness progress
        this.drawFitnessProgress();
        
        // Draw current stats
        this.drawCurrentStats();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#e9ecef';
        this.ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let y = 0; y < this.height; y += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }
    
    drawFitnessProgress() {
        if (this.data.iterations.length === 0 || this.currentStep === 0) return;
        
        const iterations = this.data.iterations.slice(0, this.currentStep + 1);
        
        // Draw fitness line
        this.ctx.strokeStyle = '#4361ee';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        iterations.forEach((iter, index) => {
            const x = (index / this.maxSteps) * this.width;
            const y = this.height - (iter.fitness * this.height);
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.stroke();
        
        // Draw temperature line (represents exploration vs exploitation)
        this.ctx.strokeStyle = 'rgba(247, 37, 133, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        iterations.forEach((iter, index) => {
            const x = (index / this.maxSteps) * this.width;
            const y = this.height - (iter.temperature * this.height);
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.stroke();
        
        // Draw current point
        const currentIter = iterations[iterations.length - 1];
        const x = ((this.currentStep) / this.maxSteps) * this.width;
        const y = this.height - (currentIter.fitness * this.height);
        
        this.ctx.fillStyle = '#4361ee';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawCurrentStats() {
        if (this.data.iterations.length === 0 || this.currentStep === 0) return;
        
        const currentIter = this.data.iterations[this.currentStep];
        
        // Draw stats box
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(10, 10, 200, 100);
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.strokeRect(10, 10, 200, 100);
        
        // Draw text
        this.ctx.fillStyle = '#212529';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Iteration: ${currentIter.iteration + 1}/${this.maxSteps}`, 20, 35);
        this.ctx.fillText(`Fitness: ${(currentIter.fitness * 100).toFixed(1)}%`, 20, 55);
        this.ctx.fillText(`Conflicts: ${currentIter.conflicts}`, 20, 75);
        this.ctx.fillText(`Temperature: ${currentIter.temperature.toFixed(2)}`, 20, 95);
    }
    
    drawFinalState() {
        // Add final state visualization
        if (!this.ctx) return;
        
        // Draw "Complete" indicator
        this.ctx.fillStyle = 'rgba(76, 201, 240, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw completion message
        this.ctx.fillStyle = '#212529';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Algorithm Convergence Complete', this.width / 2, 40);
        
        // Draw constraint satisfaction
        if (this.data.solution && this.data.solution.constraintSatisfaction) {
            const cs = this.data.solution.constraintSatisfaction;
            
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText('Constraint Satisfaction:', 20, 140);
            
            // Draw bars for each constraint
            const barWidth = this.width - 40;
            const barHeight = 15;
            const startY = 160;
            const gap = 30;
            
            // Faculty constraint
            this.drawConstraintBar('Faculty', cs.faculty, 20, startY, barWidth, barHeight);
            
            // Room constraint
            this.drawConstraintBar('Room', cs.room, 20, startY + gap, barWidth, barHeight);
            
            // Student constraint
            this.drawConstraintBar('Student', cs.student, 20, startY + gap * 2, barWidth, barHeight);
            
            // Time constraint
            this.drawConstraintBar('Time', cs.time, 20, startY + gap * 3, barWidth, barHeight);
        }
    }
    
    drawConstraintBar(label, value, x, y, maxWidth, height) {
        // Draw label
        this.ctx.fillStyle = '#212529';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(label, x, y);
        
        // Draw background bar
        this.ctx.fillStyle = '#e9ecef';
        this.ctx.fillRect(x + 70, y - height, maxWidth - 70, height);
        
        // Draw value bar
        this.ctx.fillStyle = '#4361ee';
        this.ctx.fillRect(x + 70, y - height, (maxWidth - 70) * value, height);
        
        // Draw percentage
        this.ctx.fillStyle = '#212529';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${(value * 100).toFixed(1)}%`, x + maxWidth, y);
    }
}

// Export for use in main script
window.AlgorithmVisualization = AlgorithmVisualization;
