// Origin of the JMS portal (the author/editor app). Set VITE_JMS_URL at build time
// (local: http://localhost:3002, prod: https://greenoccasion-jms.onrender.com).
const JMS = (import.meta.env.VITE_JMS_URL || '').replace(/\/$/, '');

// "Submit Research" sends visitors into the author portal (register / sign in →
// submit → track). Empty if VITE_JMS_URL is unset (the /submit page then shows a
// notice instead of redirecting).
export const submitUrl = JMS ? `${JMS}/admin/register` : '';
