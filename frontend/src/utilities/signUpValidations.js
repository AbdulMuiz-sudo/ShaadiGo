
export function checkPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "", tips: [] };

  let score = 0;
  const tips = [];

  if (password.length >= 8) {
    score++;
  } else {
    tips.push("At least 8 characters");
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    tips.push("One uppercase letter");
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    tips.push("One number");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    tips.push("One special character (!@#$…)");
  }

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

  return { score, label: labels[score], color: colors[score], tips };
}

export function validateEmail(email) {
  const trimmed = email.trim();

  if (!trimmed) return { valid: false, message: "Email is required." };

  const generalFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!generalFormat.test(trimmed)) {
    return { valid: false, message: "Please enter a valid email address." };
  }

  if (!trimmed.toLowerCase().endsWith("@gmail.com")) {
    return {
      valid: false,
      message: "Only @gmail.com addresses are accepted.",
    };
  }

  return { valid: true, message: "" };
}

export function validatePasswordMatch(password, confirmPassword) {
  if (!confirmPassword) {
    return { valid: false, message: "Please confirm your password." };
  }
  if (password !== confirmPassword) {
    return { valid: false, message: "Passwords do not match." };
  }
  return { valid: true, message: "" };
}

export function validateName(value, fieldLabel = "This field") {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, message: `${fieldLabel} is required.` };
  if (trimmed.length < 2)
    return {
      valid: false,
      message: `${fieldLabel} must be at least 2 characters.`,
    };
  if (!/^[A-Za-z\s'-]+$/.test(trimmed))
    return {
      valid: false,
      message: `${fieldLabel} can only contain letters, spaces, hyphens, or apostrophes.`,
    };
  return { valid: true, message: "" };
}

export function validateTerms(accepted) {
  if (!accepted) {
    return {
      valid: false,
      message: "You must accept the Terms & Conditions to continue.",
    };
  }
  return { valid: true, message: "" };
}

export function validateSignUpForm({ firstName, lastName, email, password, confirmPassword, terms }) {
  const errors = {};

  const fnResult = validateName(firstName, "First name");
  if (!fnResult.valid) errors.firstName = fnResult.message;

  const lnResult = validateName(lastName, "Last name");
  if (!lnResult.valid) errors.lastName = lnResult.message;

  const emailResult = validateEmail(email);
  if (!emailResult.valid) errors.email = emailResult.message;

  const { score } = checkPasswordStrength(password);
  if (!password) {
    errors.password = "Password is required.";
  } else if (score < 2) {
    errors.password = "Password is too weak. Please make it stronger.";
  }

  const matchResult = validatePasswordMatch(password, confirmPassword);
  if (!matchResult.valid) errors.confirmPassword = matchResult.message;

  const termsResult = validateTerms(terms);
  if (!termsResult.valid) errors.terms = termsResult.message;

  return { isValid: Object.keys(errors).length === 0, errors };
}