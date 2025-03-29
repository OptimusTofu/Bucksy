#!/usr/bin/env node

console.log('Current NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('Is Production:', process.env.NODE_ENV === 'production');
console.log('Is Development:', process.env.NODE_ENV === 'development'); 