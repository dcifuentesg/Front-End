import React, { useState } from 'react';
import { captchaService } from '../../services/captchaService';

const SimpleCaptchaTest = () => {
    const [captchaData, setCaptchaData] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const generateCaptcha = async () => {
        setIsLoading(true);
        setMessage('Generando CAPTCHA...');
        
        try {
            const response = await captchaService.generateCaptcha('math');
            if (response.success) {
                setCaptchaData(response.captcha);
                setMessage('CAPTCHA generado exitosamente');
            } else {
                setMessage('Error: ' + response.message);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error generando CAPTCHA: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const validateCaptcha = async () => {
        if (!captchaData || !userAnswer) {
            setMessage('Por favor genera un CAPTCHA e ingresa una respuesta');
            return;
        }

        setIsLoading(true);
        setMessage('Validando...');
        
        try {
            const response = await captchaService.validateCaptcha(captchaData.captcha_id, userAnswer);
            if (response.success && response.valid) {
                setMessage('✅ CAPTCHA válido!');
            } else {
                setMessage('❌ CAPTCHA inválido: ' + response.message);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error validando CAPTCHA: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Prueba Simple de CAPTCHA</h2>
            
            <button onClick={generateCaptcha} disabled={isLoading}>
                {isLoading ? 'Cargando...' : 'Generar CAPTCHA'}
            </button>

            {captchaData && (
                <div style={{ margin: '20px 0', textAlign: 'center' }}>
                    <img 
                        src={captchaData.image} 
                        alt="CAPTCHA" 
                        style={{ border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    {captchaData.question && (
                        <p><strong>{captchaData.question} = ?</strong></p>
                    )}
                </div>
            )}

            <div style={{ margin: '20px 0' }}>
                <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Ingresa tu respuesta"
                    style={{ 
                        padding: '8px', 
                        width: '200px', 
                        marginRight: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}
                />
                <button onClick={validateCaptcha} disabled={isLoading || !captchaData}>
                    Validar
                </button>
            </div>

            <div style={{ 
                padding: '10px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px'
            }}>
                {message}
            </div>

            {captchaData && (
                <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                    <strong>ID:</strong> {captchaData.captcha_id}
                </div>
            )}
        </div>
    );
};

export default SimpleCaptchaTest;
