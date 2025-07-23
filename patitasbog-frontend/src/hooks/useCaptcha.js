import { useState, useCallback } from 'react';
import { captchaService } from '../services/captchaService';

/**
 * Hook personalizado para manejar CAPTCHA
 * @param {Object} options - Opciones de configuración
 * @param {string} options.type - Tipo de CAPTCHA ('math' o 'text')
 * @param {boolean} options.autoValidate - Si debe validar automáticamente al cambiar la respuesta
 * @param {function} options.onSuccess - Callback cuando la validación es exitosa
 * @param {function} options.onError - Callback cuando ocurre un error
 * @returns {Object} - Objeto con estados y funciones del CAPTCHA
 */
export const useCaptcha = (options = {}) => {
  const {
    type = 'math',
    autoValidate = false,
    onSuccess,
    onError
  } = options;

  // Estados del CAPTCHA
  const [captchaData, setCaptchaData] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  // Generar nuevo CAPTCHA
  const generateCaptcha = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setUserAnswer('');
    setIsValid(false);
    setValidationMessage('');
    
    try {
      const response = await captchaService.generateCaptcha(type);
      
      if (response.success) {
        setCaptchaData(response.captcha);
        return response.captcha;
      } else {
        throw new Error('Error generando CAPTCHA');
      }
    } catch (err) {
      const errorMessage = 'Error al cargar CAPTCHA. Intenta de nuevo.';
      setError(errorMessage);
      if (onError) {
        onError(err, errorMessage);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [type, onError]);

  // Validar respuesta del CAPTCHA
  const validateCaptcha = useCallback(async (answer = userAnswer) => {
    if (!captchaData || !answer.trim()) {
      setIsValid(false);
      return false;
    }

    setIsValidating(true);
    setError('');
    
    try {
      const response = await captchaService.validateCaptcha(
        captchaData.captcha_id, 
        answer
      );
      
      const valid = response.success && response.valid;
      setIsValid(valid);
      setValidationMessage(response.message || '');
      
      if (valid && onSuccess) {
        onSuccess({
          captcha_id: captchaData.captcha_id,
          answer: answer,
          message: response.message
        });
      } else if (!valid && onError) {
        onError(new Error('CAPTCHA inválido'), response.message);
      }
      
      return valid;
      
    } catch (err) {
      const errorMessage = 'Error validando CAPTCHA';
      setError(errorMessage);
      setIsValid(false);
      if (onError) {
        onError(err, errorMessage);
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [captchaData, userAnswer, onSuccess, onError]);

  // Cambiar respuesta del usuario
  const setAnswer = useCallback((answer) => {
    setUserAnswer(answer);
    setIsValid(false);
    setValidationMessage('');
    setError('');

    // Validación automática si está habilitada
    if (autoValidate && answer.trim() && captchaData) {
      const timeoutId = setTimeout(() => {
        validateCaptcha(answer);
      }, 500); // Debounce de 500ms

      // Cleanup del timeout anterior
      return () => clearTimeout(timeoutId);
    }
  }, [autoValidate, captchaData, validateCaptcha]);

  // Reiniciar el estado del CAPTCHA
  const reset = useCallback(() => {
    setCaptchaData(null);
    setUserAnswer('');
    setIsValid(false);
    setError('');
    setValidationMessage('');
    setIsLoading(false);
    setIsValidating(false);
  }, []);

  // Obtener los datos necesarios para enviar al backend
  const getCaptchaCredentials = useCallback(() => {
    if (!isValid || !captchaData) {
      return null;
    }

    return {
      captcha_id: captchaData.captcha_id,
      captcha_answer: userAnswer
    };
  }, [isValid, captchaData, userAnswer]);

  return {
    // Estados
    captchaData,
    userAnswer,
    isLoading,
    isValidating,
    isValid,
    error,
    validationMessage,

    // Funciones
    generateCaptcha,
    validateCaptcha,
    setAnswer,
    reset,
    getCaptchaCredentials,

    // Computed properties
    isReady: captchaData !== null && !isLoading,
    canSubmit: isValid && !isLoading && !isValidating,
    
    // Datos para el formulario de login
    loginData: getCaptchaCredentials()
  };
};

/**
 * Hook simplificado para login con CAPTCHA
 * Combina el hook useCaptcha con lógica específica de login
 */
export const useCaptchaLogin = () => {
  const [loginError, setLoginError] = useState('');
  
  const captcha = useCaptcha({
    type: 'math',
    onError: (error, message) => {
      setLoginError(message || 'Error con el CAPTCHA');
    }
  });

  // Función para hacer login con CAPTCHA
  const loginWithCaptcha = useCallback(async (email, password, loginFunction) => {
    // Verificar que el CAPTCHA esté válido
    if (!captcha.isValid) {
      setLoginError('Debes resolver el CAPTCHA correctamente');
      return false;
    }

    // Obtener credenciales del CAPTCHA
    const captchaCredentials = captcha.getCaptchaCredentials();
    if (!captchaCredentials) {
      setLoginError('Error con los datos del CAPTCHA');
      return false;
    }

    // Preparar datos del login
    const loginData = {
      email,
      password,
      ...captchaCredentials
    };

    try {
      setLoginError('');
      const result = await loginFunction(loginData);
      return result;
    } catch (error) {
      // Si el error es relacionado con CAPTCHA, generar uno nuevo
      if (error.response?.data?.message?.includes('CAPTCHA') || 
          error.response?.data?.captcha_required) {
        setTimeout(() => {
          captcha.generateCaptcha();
        }, 1000);
      }
      
      setLoginError(error.response?.data?.message || 'Error en el login');
      throw error;
    }
  }, [captcha]);

  return {
    ...captcha,
    loginError,
    loginWithCaptcha,
    clearLoginError: () => setLoginError('')
  };
};
