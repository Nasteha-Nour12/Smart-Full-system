import Company from "../model/Company.js";

/* =======================================================
   CREATE COMPANY
======================================================= */
export const createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);

    res.status(201).json({
      success: true,
      message: "Company registered successfully",
      data: company,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =======================================================
   GET ALL COMPANIES
======================================================= */
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =======================================================
   GET SINGLE COMPANY
======================================================= */
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid ID",
    });
  }
};

/* =======================================================
   UPDATE COMPANY
======================================================= */
export const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =======================================================
   DELETE COMPANY
======================================================= */
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid ID",
    });
  }
};

/* =======================================================
   APPROVE / REJECT COMPANY (ADMIN)
======================================================= */
export const updateCompanyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      message: `Company ${status}`,
      data: company,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};