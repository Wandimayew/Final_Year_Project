const FormInput = ({ label, name, type = "text", register, errors, required, maxLength }) => (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input type={type} {...register(name, { required, maxLength })} className="mt-1 block w-full border rounded-md p-2" />
      {errors?.[name] && <p className="text-red-500 text-sm">{errors[name].message}</p>}
    </div>
  );
  export default FormInput;
  