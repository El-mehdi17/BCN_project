<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reset Password</title>
</head>
<body style="margin:0; padding:0; font-family:Arial; background:#f4f4f4;">

    <table width="100%" style="padding:20px;">
        <tr>
            <td align="center">

                <table width="500" style="background:white; border-radius:10px; padding:30px;">

                    <!-- LOGO -->
                    <tr>
                        <td align="center">
                            <h2 style="color:#2c3e50;">BCN</h2>
                        </td>
                    </tr>

                    <!-- TITLE -->
                    <tr>
                        <td>
                            <h3 style="color:#333;">🔐 Réinitialisation du mot de passe</h3>
                        </td>
                    </tr>

                    <!-- TEXT -->
                    <tr>
                        <td>
                            <p>Bonjour,</p>
                            <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
                            <p>Cliquez sur le bouton ci-dessous :</p>
                        </td>
                    </tr>

                    <!-- BUTTON -->
                    <tr>
                        <td align="center" style="padding:20px;">
                            <a href="{{ $url }}"
                               style="background:#3498db; color:white; padding:12px 25px; text-decoration:none; border-radius:5px;">
                                Réinitialiser mon mot de passe
                            </a>
                        </td>
                    </tr>

                    <!-- FALLBACK -->
                    <tr>
                        <td>
                            <p style="font-size:12px; color:gray;">
                                Si le bouton ne fonctionne pas, copiez ce lien :
                            </p>
                            <p style="font-size:12px;">
                                {{ $url }}
                            </p>
                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td style="padding-top:20px;">
                            <p style="font-size:12px; color:gray;">
                                ⏳ Ce lien expire dans 60 minutes.
                            </p>
                            <p style="font-size:12px; color:gray;">
                                Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
