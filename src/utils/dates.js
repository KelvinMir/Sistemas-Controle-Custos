const pad = (value) => String(value).padStart(2, "0");

export const formatarDataLocal = (date = new Date()) => {
  const data = date instanceof Date ? date : new Date(date);

  return [
    data.getFullYear(),
    pad(data.getMonth() + 1),
    pad(data.getDate()),
  ].join("-");
};

export const dataInputParaISO = (dataInput) => {
  if (!dataInput) return new Date().toISOString();

  const [ano, mes, dia] = dataInput.split("-").map(Number);
  if (!ano || !mes || !dia) return new Date().toISOString();

  return new Date(ano, mes - 1, dia, 12, 0, 0).toISOString();
};

export const isoParaDataInput = (valor) => {
  if (!valor) return formatarDataLocal();

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return formatarDataLocal();

  return formatarDataLocal(data);
};

export const formatarDataBR = (valor) => {
  if (!valor) return "";

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "";

  return data.toLocaleDateString("pt-BR");
};
