// Cmdp.jsx  version finale pro

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../services/authService";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./css/Cmd.css";

export default function Cmdp() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const token = params.get("takeToken");
  const email = params.get("email");
  
 

  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
let getEmail=localStorage.getItem("takeEmail")    
let getToken=localStorage.getItem("takeToken")
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Mot de passe minimum 8 caractères");
      return;
    }

    if (password !== password_confirmation) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const res = await authService.resetPassword(
        getToken,
        getEmail,
        password,
        password_confirmation
      );

      setSuccess(res.message);

      setTimeout(() => {
        navigate("/connexion");
      }, 2500);
  localStorage.removeItem("takeToken")
  localStorage.removeItem("takeEmail")
    } catch (err) {
      setError(err.message || "Erreur");
    }

    setLoading(false);
  };

  return (
    <div className="cmdp-container">
      <div className="cmdp-box">

        <h1>Nouveau mot de passe</h1>
        <p>{email}</p>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <input
              type={show1 ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="eye1" onClick={() => setShow1(!show1)}>
              {show1 ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="input-group">
            <input
              type={show2 ? "text" : "password"}
              placeholder="Confirmer mot de passe"
              value={password_confirmation}
              onChange={(e) =>
                setPasswordConfirmation(e.target.value)
              }
              required
            />
            <span className="eye2" onClick={() => setShow2(!show2)}>
              {show2 ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button className="btn-4" disabled={loading}>
            {loading ? "Chargement..." : "Réinitialiser"}
          </button>

        </form>

      </div>
    </div>
  );
}