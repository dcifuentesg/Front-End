import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import styles from '../../styles/Login.module.css';
import { useGoogleLogin } from '@react-oauth/google';
import { userService } from '../../services/userService';
import { validarCorreo } from '../../utils/usuariosUtils';
import { useCaptchaLogin } from '../../hooks/useCaptcha';

/**
 * Versión alternativa del FormLogin usando el hook personalizado useCaptchaLogin
 * Esta versión es más limpia y fácil de mantener
 */
const FormLoginWithHook = () => {
    const { login } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    // Hook personalizado para CAPTCHA
    const {
        captchaData,
        userAnswer,
        isValid: captchaIsValid,
        isLoading: captchaIsLoading,
        error: captchaError,
        validationMessage,
        generateCaptcha,
        validateCaptcha,
        setAnswer,
        loginError,
        loginWithCaptcha,
        clearLoginError
    } = useCaptchaLogin();

    // Generar CAPTCHA al montar el componente
    React.useEffect(() => {
        generateCaptcha();
    }, [generateCaptcha]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        clearLoginError();

        // Validar correo
        if (!validarCorreo(correo)) {
            setErrorMessage("No es posible iniciar sesión porque... El correo no tiene un formato válido");
            setIsLoading(false);
            return;
        }

        try {
            // Usar el hook para hacer login con CAPTCHA
            const response = await loginWithCaptcha(
                correo, 
                password, 
                userService.loginUser
            );

            if (response.token) {
                login(response.token);
                setSuccessMessage('¡Login exitoso! Redirigiendo...');
                setTimeout(() => {
                    navigate('/home');
                }, 1500);
            }
        } catch (error) {
            if (error.message === "Network Error") {
                setErrorMessage("No se pudo conectar con el servidor. Revisa tu conexión o inténtalo más tarde.");
            } else {
                // El loginError ya se maneja en el hook
                setErrorMessage(loginError || "Ocurrió un error inesperado. Inténtalo más tarde.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await userService.googleLogin({
                id_token: credentialResponse.credential
            });

            if (response.token) {
                login(response.token);
                setSuccessMessage('¡Login con Google exitoso! Redirigiendo...');
                setTimeout(() => {
                    navigate('/home');
                }, 1500);
            }
        } catch (error) {
            if (error.message === "Network Error") {
                setErrorMessage("No se pudo conectar con el servidor. Revisa tu conexión o inténtalo más tarde.");
            } else if (error.response?.data?.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("Ocurrió un error inesperado. Inténtalo más tarde.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLoginError = () => {
        setErrorMessage('Error al iniciar sesión con Google. Inténtalo de nuevo.');
    };

    const loginGoogle = useGoogleLogin({
        onSuccess: handleGoogleLoginSuccess,
        onError: handleGoogleLoginError,
        flow: 'implicit',
    });

    return (
        <div className={styles.formBox}>
            <div className={styles.formHeader}>
                <p className={styles.formTitle}>
                   Inicia Sesión</p>
                <p className={styles.registerRedirectText}>
                   ¿No tienes una cuenta?{' '}
                    <Link to="/register" className={styles.registerRedirectLink}>Crea una</Link>
                </p>
            </div>
            <div className={styles.formLoginBody}>
                <form onSubmit={handleSubmit}>
                    <label className={styles.inputLabel}>
                        Correo electrónico
                    </label>
                    <input 
                        className={styles.formInput}
                        type="email"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                    />
                    
                    <label className={styles.inputLabel}>
                        Contraseña
                    </label>
                    <div className={styles.patitasPasswordContainer}>
                        <input
                            type={showPassword ? "text" : "password"}
                            className={styles.formInput}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className={styles.patitasPasswordToggle}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <img
                                src={showPassword ? "/icons/closed_eye.svg" : "/icons/open_eye.svg"}
                                alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                width="20"
                                height="20"
                            />
                        </button>
                    </div>
                    
                    <Link to="/recover_password" className={styles.recoverPasswordRedirect}>
                        ¿Olvidaste tu contraseña?
                    </Link>

                    {/* CAPTCHA integrado con el hook */}
                    <div className="captcha-section" style={{ margin: '20px 0' }}>
                        <label className={styles.inputLabel}>
                            🤖 Verificación CAPTCHA - Resuelve la operación:
                        </label>
                        
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '15px', 
                            marginBottom: '10px',
                            padding: '15px',
                            border: '2px solid #e1e5e9',
                            borderRadius: '8px',
                            backgroundColor: '#f8f9fa'
                        }}>
                            {captchaIsLoading ? (
                                <div style={{ textAlign: 'center', color: '#666' }}>
                                    ⏳ Cargando CAPTCHA...
                                </div>
                            ) : captchaData ? (
                                <>
                                    <img
                                        src={captchaData.image}
                                        alt="CAPTCHA"
                                        style={{ 
                                            maxWidth: '200px', 
                                            border: '2px solid #007bff', 
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={generateCaptcha}
                                        title="Haz clic para generar un nuevo CAPTCHA"
                                    />
                                    {captchaData.question && (
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                                            {captchaData.question} = ?
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={generateCaptcha}
                                        style={{
                                            background: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '35px',
                                            height: '35px',
                                            fontSize: '16px',
                                            cursor: 'pointer'
                                        }}
                                        title="Generar nuevo CAPTCHA"
                                    >
                                        🔄
                                    </button>
                                </>
                            ) : null}
                        </div>

                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onBlur={() => userAnswer && validateCaptcha()}
                            placeholder="Ingresa tu respuesta"
                            className={styles.formInput}
                            style={{
                                textAlign: 'center',
                                fontSize: '16px',
                                fontWeight: '500',
                                borderColor: captchaIsValid ? '#28a745' : 
                                           validationMessage && !captchaIsValid ? '#dc3545' : '#ced4da',
                                backgroundColor: captchaIsValid ? '#f8fff9' : 
                                                validationMessage && !captchaIsValid ? '#fff5f5' : 'white'
                            }}
                            required
                        />

                        {validationMessage && (
                            <div style={{
                                marginTop: '8px',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: '500',
                                textAlign: 'center',
                                backgroundColor: captchaIsValid ? '#d4edda' : '#f8d7da',
                                color: captchaIsValid ? '#155724' : '#721c24',
                                border: `1px solid ${captchaIsValid ? '#c3e6cb' : '#f5c6cb'}`
                            }}>
                                {captchaIsValid ? '✅ Correcto' : '❌ Incorrecto'}
                            </div>
                        )}

                        {(captchaError || loginError) && (
                            <div className={styles.mensaje_error} style={{ marginTop: '10px' }}>
                                {captchaError || loginError}
                            </div>
                        )}

                        <div style={{ marginTop: '10px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                            💡 Haz clic en la imagen para generar un nuevo CAPTCHA
                        </div>
                    </div>
                    
                    <br />
                    <button 
                        className={styles.loginButton}
                        disabled={isLoading || !captchaIsValid}
                        style={{
                            opacity: (!captchaIsValid || isLoading) ? 0.6 : 1,
                            cursor: (!captchaIsValid || isLoading) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading && !successMessage ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>
                
                <div className={styles.oSeparator}>
                    <span className={styles.horizontalLine}></span>
                    <p className={styles.o}>ó</p>
                    <span className={styles.horizontalLine}></span>
                </div>
                
                <button onClick={() => loginGoogle()} className={styles.googleButton}>
                    <img
                        src="/icons/google.svg"
                        alt="Google"
                        className={styles.googleIcon}
                    />
                    Iniciar sesión con Google
                </button>
            </div>    
            {errorMessage && <div className={styles.mensaje_error}>{errorMessage}</div>}
            {successMessage && <div className={styles.mensaje_exito}>{successMessage}</div>}
        </div>
    );
};

export default FormLoginWithHook;
