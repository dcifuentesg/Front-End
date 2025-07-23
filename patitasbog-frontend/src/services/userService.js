import userApi from "./httpClients/userApi";

export const userService = {
  // Métodos de registro y login
  registerUser: (userData) => userApi.post("/api/users/register", userData),
  
  // Login actualizado para soportar CAPTCHA
  loginUser: (credentials) => {
    // credentials puede incluir: email, password, captcha_id, captcha_answer, recaptcha_response
    return userApi.post("/api/users/login", credentials);
  },
  // Método para obtener el perfil del usuario
  getUserProfile: () => userApi.get("/api/profile/"),
  updateUserProfile: (userData) => userApi.put("/api/profile/", userData),
  changePassword: (passwordData) =>
    userApi.put("/api/profile/change-password", passwordData),
  uploadProfilePicture: (formData) =>
    userApi.post("/api/profile/upload-picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  
  getUserById: (userId) => userApi.get(`/api/profile/user/${userId}`),
  // Métodos para recuperar contraseña
  requestPasswordReset: ({email}) => userApi.post("/api/auth/forgot-password", { email }),
  verifyToken: ({ email, token }) => userApi.post("/api/auth/verify-token", { email, token }),
  resetPassword: (passwordData) =>
    userApi.post("/api/auth/reset-password", passwordData),

  // Autenticación con Google OAuth2
  /**
   * Inicia sesión o registra al usuario usando un id_token de Google.
   * @param {{ id_token: string }} tokenData
   * @returns {Promise<Object>}  Datos del usuario y/o nuevo JWT emitido por tu API.
   */
  googleLogin: (tokenData) =>
    userApi.post("/api/auth/google_login", tokenData, {
      // Sobrescribimos Authorization solo para esta llamada,
      // de modo que no se envíe el JWT local si existe.
      headers: { Authorization: undefined },
    }),
};