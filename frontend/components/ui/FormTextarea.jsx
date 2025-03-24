const FormTextarea = ({ label, name, register }) => (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <textarea {...register(name)} className="mt-1 block w-full border rounded-md p-2" rows="4" />
    </div>
  );
  export default FormTextarea;
  