import Certificate from "../model/Certificate.js";

/* =======================================================
   ADMIN: ISSUE CERTIFICATE
======================================================= */
export const issueCertificate = async (req, res) => {
  try {
    const { candidateId, sourceType, sourceId, certificateUrl, issuedAt } = req.body;

    const cert = await Certificate.create({
      candidateId,
      sourceType,
      sourceId,
      certificateUrl,
      issuedAt: issuedAt || Date.now(),
    });

    res.status(201).json({
      success: true,
      message: "Certificate issued successfully",
      data: cert,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Certificate already exists for this source",
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   JOB_SEEKER: GET MY CERTIFICATES
======================================================= */
export const getMyCertificates = async (req, res) => {
  try {
    const list = await Certificate.find({ candidateId: req.user.id })
      .sort({ issuedAt: -1 });

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: GET ALL CERTIFICATES (optional filters)
   ?sourceType=PROGRAM
======================================================= */
export const getAllCertificates = async (req, res) => {
  try {
    const { sourceType, candidateId } = req.query;

    const filter = {};
    if (sourceType) filter.sourceType = sourceType;
    if (candidateId) filter.candidateId = candidateId;

    const list = await Certificate.find(filter)
      .populate("candidateId", "username email")
      .sort({ issuedAt: -1 });

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: GET ONE
======================================================= */
export const getCertificateById = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).populate(
      "candidateId",
      "username email"
    );

    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    res.json({ success: true, data: cert });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID" });
  }
};

/* =======================================================
   ADMIN: DELETE CERTIFICATE
======================================================= */
export const deleteCertificate = async (req, res) => {
  try {
    const deleted = await Certificate.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    res.json({ success: true, message: "Certificate deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID" });
  }
};
