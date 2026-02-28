import { describe, it, expect } from 'vitest';

describe('Frontend', () => {
    it('should have correct app title', () => {
        expect('Demo Fullstack App').toBeTruthy();
    });

    it('should have API URL configured', () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        expect(apiUrl).toContain('/api');
    });
});
