import React, { useState, useEffect, useCallback } from 'react';
import { captchaService } from '../../services/captchaService';
import styles from '../../styles/Captcha.module.css';

const CaptchaComponent = ({ 
  onCaptchaChange, 
  onValidationChange, 
  type = 'math',
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutos por defecto
}) => {
  const [captchaData, setCaptchaData] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Generar nuevo CAPTCHA
  const generateCaptcha = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setUserAnswer('');
    
    try {
      const response = await captchaService.generateCaptcha(type);
      
      if (response.success) {
        setCaptchaData(response.captcha);
        
        // Reset validación
        if (onValidationChange) {
          onValidationChange({
            isValid: false,
            captcha_id: response.captcha.captcha_id,
            answer: ''
          });
        }
      } else {
        throw new Error('Error generando CAPTCHA');
      }
    } catch (error) {
      console.error('Error generando CAPTCHA:', error);
      setError('Error al cargar CAPTCHA. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [type]); // Solo depender de 'type', no de onValidationChange

  // validateAnswer COMENTADO: No validar en el frontend para evitar consumir el token
  // const validateAnswer = useCallback(async (answer) => {
  //   // Lógica de validación comentada
  // }, []);

  // Manejar cambio en la respuesta del usuario
  const handleAnswerChange = (e) => {
    const newAnswer = e.target.value;
    setUserAnswer(newAnswer);
    
    // Notificar al padre sobre el cambio de respuesta
    // Solo marcamos como "válido" si hay una respuesta (el backend hará la validación real)
    if (onValidationChange) {
      onValidationChange({
        isValid: newAnswer.trim().length > 0, // Simplemente verificar que hay una respuesta
        captcha_id: captchaData?.captcha_id,
        answer: newAnswer.trim()
      });
    }
  };

  // Validación automática después de un delay cuando el usuario para de escribir
  // COMENTADO: Eliminar validación automática para evitar consumir el token
  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     if (userAnswer.trim() && captchaData && !lastValidation?.isValid) {
  //       validateAnswer(userAnswer);
  //     }
  //   }, 1000);

  //   return () => clearTimeout(timeoutId);
  // }, [userAnswer, captchaData, lastValidation, validateAnswer]);

  // Generar CAPTCHA inicial - Solo una vez
  useEffect(() => {
    generateCaptcha();
  }, []); // Sin dependencias para evitar bucles infinitos

  // Auto-refresh del CAPTCHA (opcional)
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(generateCaptcha, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, generateCaptcha]);

  // Notificar cambios en captchaData al componente padre
  useEffect(() => {
    if (captchaData && onCaptchaChange) {
      onCaptchaChange({
        captcha_id: captchaData.captcha_id,
        type: type,
        generated: true
      });
    }
  }, [captchaData, onCaptchaChange, type]);

  if (error && !captchaData) {
    return (
      <div className={styles.captchaContainer}>
        <div className={styles.captchaError}>
          <p>❌ {error}</p>
          <button 
            onClick={generateCaptcha}
            className={styles.refreshButton}
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : '🔄 Reintentar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.captchaContainer}>
      <div className={styles.captchaHeader}>
        <label className={styles.captchaLabel}>
          🤖 Verificación CAPTCHA
          {type === 'math' ? ' - Resuelve la operación:' : ' - Ingresa el texto:'}
        </label>
      </div>

      <div className={styles.captchaImageContainer}>
        {isLoading ? (
          <div className={styles.captchaLoading}>
            <p>⏳ Generando CAPTCHA...</p>
          </div>
        ) : captchaData ? (
          <>
            <img
              src={captchaData.image}
              alt="CAPTCHA"
              className={styles.captchaImage}
              onClick={generateCaptcha}
              title="Haz clic para generar un nuevo CAPTCHA"
            />
            {captchaData.question && (
              <p className={styles.captchaQuestion}>
                {captchaData.question} = ?
              </p>
            )}
          </>
        ) : null}
        
        <button
          type="button"
          onClick={generateCaptcha}
          className={styles.refreshButton}
          disabled={isLoading}
          title="Generar nuevo CAPTCHA"
        >
          {isLoading ? '⏳' : '🔄'}
        </button>
      </div>

      <div className={styles.captchaInputContainer}>
        <input
          type="text"
          value={userAnswer}
          onChange={handleAnswerChange}
          placeholder="Ingresa tu respuesta"
          className={styles.captchaInput}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className={styles.captchaError}>
          ⚠️ {error}
        </div>
      )}

      <div className={styles.captchaHints}>
        <small>💡 Haz clic en la imagen para generar un nuevo CAPTCHA</small>
      </div>
    </div>
  );
};

export default CaptchaComponent;
