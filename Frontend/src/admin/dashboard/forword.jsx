import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/forword.css";
import authService from "../services/authService";

export default function ForWord() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [strength, setStrength] = useState({
    score: 0,
    label: "",
  });

  // ===============================
  // Password Strength
  // ===============================
  const checkStrength = (pwd) => {
    let score = 0;

    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    let label = "Faible";

    if (score >= 4) label = "Moyen";
    if (score >= 6) label = "Fort";

    return { score, label };
  };

  // ===============================
  // Handle Inputs
  // ===============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (name === "password") {
      setStrength(checkStrength(value));
    }

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ===============================
  // Validation
  // ===============================
  const validate = () => {
    const newErrors = {};

    if (!form.email) {
      newErrors.email = "Email requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email invalide";
    }

    if (!form.password) {
      newErrors.password = "Mot de passe requis";
    } else if (form.password.length < 8) {
      newErrors.password = "Minimum 8 caractères";
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = "Une majuscule requise";
    } else if (!/[a-z]/.test(form.password)) {
      newErrors.password = "Une minuscule requise";
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = "Un chiffre requis";
    } else if (!/[^A-Za-z0-9]/.test(form.password)) {
      newErrors.password = "Un caractère spécial requis";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirmation requise";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ===============================
  // Submit
  // ===============================
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;


  const email = form.email.trim();

 

  try {
    setLoading(true);

    await authService.MOTdepass(
      email,
      form.password,
      form.confirmPassword
    );

    alert("Mot de passe modifié avec succès");

    localStorage.removeItem("takeToken"); 
    navigate("/admin/login");

  } catch (error) {
    console.log(error);

    setErrors({
      global: error.message || "Erreur serveur"
    });

  } finally {
    setLoading(false);
  }
};

  return (
    <form className="form" onSubmit={handleSubmit}>
      {/* Global Error */}
      {errors.global && (
        <div className="error-message">{errors.global}</div>
      )}

      {/* Email */}
      <div className="form-group">
        <label>Email</label>

        <input
          type="email"
          name="email"
          className={`input ${errors.email ? "error" : ""}`}
          value={form.email}
          onChange={handleChange}
          placeholder="email@gmail.com"
        />

        {errors.email && (
          <span className="error-message">{errors.email}</span>
        )}
      </div>

      {/* Password */}
      <div className="form-group">
        <label>Nouveau mot de passe</label>

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className={`input ${errors.password ? "error" : ""}`}
            value={form.password}
            onChange={handleChange}
            placeholder="********"
          />

          <button
            type="button"
            className="eye"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </button>
        </div>

        {form.password && (
          <div className="password-strength">
            Force: {strength.label}
            <div className="strength-bar">
              <div
                style={{
                  width: `${(strength.score / 6) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {errors.password && (
          <span className="error-message">
            {errors.password}
          </span>
        )}
      </div>

      {/* Confirm */}
      <div className="form-group">
        <label>Confirmer mot de passe</label>

        <div className="password-wrapper">
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            className={`input ${
              errors.confirmPassword ? "error" : ""
            }`}
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="********"
          />

          <button
            type="button"
            className="eye"
            onClick={() =>
              setShowConfirm(!showConfirm)
            }
          >
            {showConfirm ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </button>
        </div>

        {errors.confirmPassword && (
          <span className="error-message">
            {errors.confirmPassword}
          </span>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="submit-btn"
        disabled={loading}
      >
        {loading
          ? "Chargement..."
          : "Changer le mot de passe"}
      </button>
    </form>
  );
}