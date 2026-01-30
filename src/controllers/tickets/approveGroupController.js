const approveGroupService = require("../../services/tickets/approveGroupService");

const approveGroupController = async (req, res) => {
  try {
    const { ticketId, groupId } = req.params;
    
    const result = await approveGroupService(ticketId, groupId, req.user);
    
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro interno ao aprovar grupo.",
      success: false,
    });
  }
};

module.exports = approveGroupController;
