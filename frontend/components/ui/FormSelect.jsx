const FormSelect = ({ label, name, register, options, required }) => (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <select {...register(name, { required })} className="mt-1 block w-full border rounded-md p-2">
        <option value="">Select...</option>
        {options.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
  );
  export default FormSelect;
  