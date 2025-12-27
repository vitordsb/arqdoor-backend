const Step = require("../models/Step");
const dayjs = require("dayjs");

const updateTicketTotal = async (ticket) => {
  const steps = await Step.findAll({ where: { ticket_id: ticket.id } });

  const total = steps.reduce((acc, s) => acc + s.price, 0);
  ticket.total_price = total;
  await ticket.save();
  console.log(`Total do ticket ${ticket.id} atualizado com sucesso`);

  const totalDate = steps.reduce((acumulador, step) => {
    const data1 = dayjs(step.start_date);
    const data2 = dayjs(step.end_date);

    if (!data1.isValid() || !data2.isValid()) {
      console.warn(
        `Step ${step.id} com datas inválidas, ignorando no total_date (start_date=${step.start_date}, end_date=${step.end_date})`
      );
      return acumulador;
    }

    const diff = data2.diff(data1, "day");
    return Number.isFinite(diff) ? acumulador + diff : acumulador;
  }, 0);

  ticket.total_date = totalDate;

  const allStepsConcluded =
    steps.length > 0 &&
    steps.every(
      (step) => String(step.status || "").toLowerCase() === "concluido"
    );

  if (allStepsConcluded && ticket.status !== "concluída") {
    ticket.status = "concluída";
  }

  await ticket.save();
};

module.exports = updateTicketTotal;
