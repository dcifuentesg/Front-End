import React, { useState } from 'react';
import CaptchaComponent from '../components/Login/CaptchaComponent';
import { useCaptcha } from '../hooks/useCaptcha';
import styles from '../styles/Login.module.css';

/**
 * Página de prueba para demostrar el uso del sistema CAPTCHA
 * Puedes acceder a esta página en /captcha-test para probar la funcionalidad
 */
const CaptchaTestPage = () => {
    const [testResults, setTestResults] = useState([]);
    
    // Estados para el test con componente
    const [componentCaptchaData, setComponentCaptchaData] = useState(null);
    const [componentValidation, setComponentValidation] = useState({ isValid: false });
    
    // Hook para el test con hook personalizado
    const {
        captchaData: hookCaptchaData,
        userAnswer,
        isValid: hookIsValid,
        isLoading: hookIsLoading,
        error: hookError,
        validationMessage,
        generateCaptcha: hookGenerateCaptcha,
        validateCaptcha: hookValidateCaptcha,
        setAnswer,
        getCaptchaCredentials
    } = useCaptcha({
        type: 'math',
        autoValidate: false,
        onSuccess: (data) => {
            addTestResult('✅ Hook: CAPTCHA validado exitosamente', 'success');
        },
        onError: (error, message) => {
            addTestResult(`❌ Hook: ${message}`, 'error');
        }
    });

    // Función para agregar resultados de test
    const addTestResult = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setTestResults(prev => [
            ...prev,
            { message, type, timestamp, id: Date.now() }
        ].slice(-10)); // Mantener solo los últimos 10 resultados
    };

    // Handlers para el componente CAPTCHA
    const handleComponentCaptchaChange = (data) => {
        setComponentCaptchaData(data);
        addTestResult(`🤖 Componente: CAPTCHA generado (ID: ${data.captcha_id?.slice(0, 8)}...)`, 'info');
    };

    const handleComponentValidationChange = (validation) => {
        setComponentValidation(validation);
        if (validation.isValid) {
            addTestResult('✅ Componente: CAPTCHA validado exitosamente', 'success');
        } else if (validation.answer) {
            addTestResult('❌ Componente: CAPTCHA inválido', 'error');
        }
    };

    // Test del hook manualmente
    const testHookValidation = async () => {
        if (!hookCaptchaData || !userAnswer) {
            addTestResult('⚠️ Hook: Necesitas generar un CAPTCHA y escribir una respuesta', 'warning');
            return;
        }

        addTestResult('🔄 Hook: Validando CAPTCHA...', 'info');
        const isValid = await hookValidateCaptcha();
        
        if (isValid) {
            const credentials = getCaptchaCredentials();
            addTestResult(`✅ Hook: Validación exitosa. Credenciales listas: ${JSON.stringify(credentials)}`, 'success');
        }
    };

    // Simular login con CAPTCHA
    const simulateLogin = () => {
        if (!componentValidation.isValid) {
            addTestResult('⚠️ Login: Necesitas un CAPTCHA válido para hacer login', 'warning');
            return;
        }

        addTestResult('🚀 Login: Simulando login con CAPTCHA válido...', 'info');
        
        // Simular llamada al backend
        setTimeout(() => {
            const success = Math.random() > 0.3; // 70% de éxito
            if (success) {
                addTestResult('✅ Login: ¡Login exitoso!', 'success');
            } else {
                addTestResult('❌ Login: Error en credenciales (CAPTCHA se regenerará)', 'error');
                // El componente se regenerará automáticamente
            }
        }, 1000);
    };

    // Limpiar resultados
    const clearResults = () => {
        setTestResults([]);
    };

    // Generar CAPTCHA del hook al montar
    React.useEffect(() => {
        hookGenerateCaptcha();
        addTestResult('🎯 Página de prueba CAPTCHA iniciada', 'info');
    }, [hookGenerateCaptcha]);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>
                🧪 Página de Prueba - Sistema CAPTCHA
            </h1>
            
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <p style={{ color: '#666' }}>
                    Esta página demuestra el funcionamiento del sistema CAPTCHA integrado.
                    Prueba ambas implementaciones y observa los resultados en tiempo real.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                {/* Test con Componente CAPTCHA */}
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                    <h2 style={{ color: '#007bff', marginBottom: '20px' }}>
                        🎨 Test con Componente
                    </h2>
                    
                    <CaptchaComponent
                        type="math"
                        onCaptchaChange={handleComponentCaptchaChange}
                        onValidationChange={handleComponentValidationChange}
                        autoRefresh={false}
                    />
                    
                    <div style={{ marginTop: '15px' }}>
                        <p><strong>Estado:</strong> {componentValidation.isValid ? '✅ Válido' : '❌ Inválido'}</p>
                        <p><strong>CAPTCHA ID:</strong> {componentCaptchaData?.captcha_id?.slice(0, 16) || 'No generado'}...</p>
                        
                        <button
                            onClick={simulateLogin}
                            disabled={!componentValidation.isValid}
                            style={{
                                backgroundColor: componentValidation.isValid ? '#28a745' : '#6c757d',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '4px',
                                cursor: componentValidation.isValid ? 'pointer' : 'not-allowed',
                                marginTop: '10px'
                            }}
                        >
                            🚀 Simular Login
                        </button>
                    </div>
                </div>

                {/* Test con Hook */}
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                    <h2 style={{ color: '#28a745', marginBottom: '20px' }}>
                        🎯 Test con Hook
                    </h2>
                    
                    <div style={{ marginBottom: '15px' }}>
                        {hookIsLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                ⏳ Generando CAPTCHA...
                            </div>
                        ) : hookCaptchaData ? (
                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                <img
                                    src={hookCaptchaData.image}
                                    alt="CAPTCHA Hook"
                                    style={{ 
                                        maxWidth: '200px', 
                                        border: '2px solid #28a745', 
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={hookGenerateCaptcha}
                                />
                                {hookCaptchaData.question && (
                                    <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '10px 0' }}>
                                        {hookCaptchaData.question} = ?
                                    </p>
                                )}
                            </div>
                        ) : null}
                        
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Respuesta del hook CAPTCHA"
                            className={styles.formInput}
                            style={{
                                width: '100%',
                                textAlign: 'center',
                                marginBottom: '10px',
                                borderColor: hookIsValid ? '#28a745' : '#ced4da',
                                backgroundColor: hookIsValid ? '#f8fff9' : 'white'
                            }}
                        />
                        
                        {validationMessage && (
                            <div style={{
                                padding: '8px',
                                borderRadius: '4px',
                                marginBottom: '10px',
                                backgroundColor: hookIsValid ? '#d4edda' : '#f8d7da',
                                color: hookIsValid ? '#155724' : '#721c24',
                                textAlign: 'center',
                                fontSize: '14px'
                            }}>
                                {hookIsValid ? '✅ Correcto' : '❌ Incorrecto'}
                            </div>
                        )}
                        
                        {hookError && (
                            <div style={{
                                padding: '8px',
                                borderRadius: '4px',
                                backgroundColor: '#f8d7da',
                                color: '#721c24',
                                marginBottom: '10px',
                                fontSize: '14px'
                            }}>
                                ⚠️ {hookError}
                            </div>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={hookGenerateCaptcha}
                            disabled={hookIsLoading}
                            style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            🔄 Regenerar
                        </button>
                        
                        <button
                            onClick={testHookValidation}
                            disabled={!userAnswer || hookIsLoading}
                            style={{
                                backgroundColor: '#ffc107',
                                color: '#212529',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            ✅ Validar
                        </button>
                    </div>
                    
                    <div style={{ marginTop: '15px' }}>
                        <p><strong>Estado:</strong> {hookIsValid ? '✅ Válido' : '❌ Inválido'}</p>
                        <p><strong>CAPTCHA ID:</strong> {hookCaptchaData?.captcha_id?.slice(0, 16) || 'No generado'}...</p>
                    </div>
                </div>
            </div>

            {/* Panel de Resultados */}
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ color: '#333', margin: 0 }}>📊 Resultados de las Pruebas</h3>
                    <button
                        onClick={clearResults}
                        style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        🗑️ Limpiar
                    </button>
                </div>
                
                <div style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa'
                }}>
                    {testResults.length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
                            No hay resultados aún. Interactúa con los CAPTCHAs para ver los logs.
                        </p>
                    ) : (
                        testResults.map(result => (
                            <div
                                key={result.id}
                                style={{
                                    padding: '8px',
                                    marginBottom: '6px',
                                    borderRadius: '4px',
                                    backgroundColor: 
                                        result.type === 'success' ? '#d4edda' :
                                        result.type === 'error' ? '#f8d7da' :
                                        result.type === 'warning' ? '#fff3cd' : '#e2e3e5',
                                    color:
                                        result.type === 'success' ? '#155724' :
                                        result.type === 'error' ? '#721c24' :
                                        result.type === 'warning' ? '#856404' : '#383d41',
                                    fontSize: '13px',
                                    fontFamily: 'monospace'
                                }}
                            >
                                <strong>{result.timestamp}</strong> - {result.message}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Instrucciones */}
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
                <h3 style={{ color: '#0066cc', marginTop: 0 }}>📖 Instrucciones de Uso</h3>
                <ol style={{ color: '#333', lineHeight: '1.6' }}>
                    <li><strong>Componente:</strong> Resuelve el CAPTCHA automáticamente. El botón de login se habilitará cuando esté correcto.</li>
                    <li><strong>Hook:</strong> Escribe la respuesta y haz clic en "Validar" para probar la validación manual.</li>
                    <li><strong>Regenerar:</strong> Haz clic en la imagen o en el botón de regenerar para obtener un nuevo CAPTCHA.</li>
                    <li><strong>Monitoreo:</strong> Observa el panel de resultados para ver todos los eventos en tiempo real.</li>
                    <li><strong>Simulación:</strong> El botón "Simular Login" demuestra cómo se integraría en un formulario real.</li>
                </ol>
                
                <p style={{ marginBottom: 0, fontWeight: 'bold', color: '#0066cc' }}>
                    💡 Esta página es solo para pruebas. En producción, el CAPTCHA se integrará en el formulario de login real.
                </p>
            </div>
        </div>
    );
};

export default CaptchaTestPage;
