import { useEffect, useState } from "react";
import Modal from "../Modal";
import { useAuth } from "../../context/AuthContext";
import { IconEyeCheck, IconEyeClosed } from "@tabler/icons-react";

const INITIAL_FORM = {
  email: "",
  password: "",
};

const SignInModal = ({ open, onClose }) => {
  const { signIn, isLoading, error } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [localError, setLocalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
      setLocalError(null);
    }
  }, [open]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setLocalError(null);
  };

  const handleSubmit = async () => {
    try {
      await signIn(form);
      setLocalError(null);
      onClose();
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const combinedError = localError || error;

  return (
    <Modal
      title="Sign In"
      save={handleSubmit}
      cancel={onClose}
      show={open}
      confirmLabel={isLoading ? "Signing in..." : "Sign In"}
      cancelLabel="Close"
      disableConfirm={isLoading}
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="w-full">
          <label className="block text-gray-700 text-sm font-semibold mb-1">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full placeholder:text-gray-500"
            placeholder="admin@ovarc.dev"
            autoFocus
          />
        </div>
        <div className="w-full">
          <label className="block text-gray-700 text-sm font-semibold mb-1 placeholder:text-gray-500">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full pr-10"
              placeholder="********"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 text-sm text-main hover:text-main/80"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <IconEyeClosed stroke={2} />
              ) : (
                <IconEyeCheck stroke={2} />
              )}
            </button>
          </div>
        </div>
        {combinedError && (
          <p className="text-sm text-red-600">{combinedError}</p>
        )}
      </div>
    </Modal>
  );
};

export default SignInModal;
