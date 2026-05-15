export const parseNumero = (valor) => {
  if (valor === null || valor === undefined) return 0;

  const texto = String(valor).trim().replace(/[^\d,.-]/g, "");
  if (!texto) return 0;

  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;
  const numero = Number(normalizado);

  return Number.isFinite(numero) ? numero : 0;
};
