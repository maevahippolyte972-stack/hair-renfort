import { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FormField({ label, id, ...props }: FormFieldProps) {
  return (
    <label htmlFor={id} className="block text-sm">
      <span className="mb-1.5 block text-noir-chaud/80">{label}</span>
      <input
        id={id}
        {...props}
        className="w-full rounded-lg border border-noir-chaud/20 bg-white px-4 py-2.5 text-noir-chaud outline-none transition focus:border-laiton"
      />
    </label>
  );
}
