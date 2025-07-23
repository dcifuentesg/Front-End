import userApi from "./httpClients/userApi";

export const captchaService = {
  /**
   * Genera un nuevo CAPTCHA
   * @param {string} type - Tipo de CAPTCHA: 'math' o 'text'
   * @returns {Promise<Object>} - Datos del CAPTCHA generado
   */
  generateCaptcha: (type = 'math') => 
    userApi.post("/api/captcha/generate", { type }),

  /**
   * Valida una respuesta de CAPTCHA
   * @param {string} captchaId - ID del CAPTCHA
   * @param {string} answer - Respuesta del usuario
   * @returns {Promise<Object>} - Resultado de la validación
   */
  validateCaptcha: (captchaId, answer) =>
    userApi.post("/api/captcha/validate", {
      captcha_id: captchaId,
      answer: answer
    }),

  /**
   * Obtiene la clave del sitio para reCAPTCHA
   * @returns {Promise<Object>} - Site key de reCAPTCHA
   */
  getRecaptchaSiteKey: () =>
    userApi.get("/api/captcha/recaptcha/site-key"),

  /**
   * Verifica un token de reCAPTCHA
   * @param {string} recaptchaResponse - Token de respuesta de reCAPTCHA
   * @returns {Promise<Object>} - Resultado de la verificación
   */
  verifyRecaptcha: (recaptchaResponse) =>
    userApi.post("/api/captcha/recaptcha/verify", {
      recaptcha_response: recaptchaResponse
    }),

  /**
   * Limpia CAPTCHAs expirados (endpoint administrativo)
   * @returns {Promise<Object>} - Resultado de la limpieza
   */
  cleanupExpiredCaptchas: () =>
    userApi.post("/api/captcha/cleanup")
};
