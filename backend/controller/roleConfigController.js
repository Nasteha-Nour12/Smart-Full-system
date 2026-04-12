import { z } from "zod";
import RoleConfig from "../model/RoleConfig.js";
import { DEFAULT_ADMIN_PAGES, PAGE_ACCESS } from "../constants/pageAccess.js";

const roleSchema = z.object({
  name: z.string().trim().min(2).max(40),
  description: z.string().trim().max(200).optional(),
  pages: z.array(z.enum(PAGE_ACCESS)).min(1),
});

const ensureDefaultRole = async () => {
  await RoleConfig.findOneAndUpdate(
    { name: "ADMIN" },
    {
      name: "ADMIN",
      description: "Full access role",
      pages: DEFAULT_ADMIN_PAGES,
      isSystem: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const getRoleConfigs = async (_req, res) => {
  try {
    await ensureDefaultRole();
    const roles = await RoleConfig.find().sort({ isSystem: -1, name: 1 });
    res.json({ success: true, data: roles, pageAccessOptions: PAGE_ACCESS });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRoleConfig = async (req, res) => {
  try {
    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues?.[0]?.message || "Invalid input" });
    }

    const payload = {
      ...parsed.data,
      name: parsed.data.name.toUpperCase().replace(/\s+/g, "_"),
      description: parsed.data.description || "",
    };

    const exists = await RoleConfig.findOne({ name: payload.name });
    if (exists) {
      return res.status(409).json({ success: false, message: "Role already exists" });
    }

    const role = await RoleConfig.create(payload);
    res.status(201).json({ success: true, message: "Role created", data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRoleConfig = async (req, res) => {
  try {
    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues?.[0]?.message || "Invalid input" });
    }

    const role = await RoleConfig.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });

    const nextName = parsed.data.name.toUpperCase().replace(/\s+/g, "_");
    if (role.isSystem && nextName !== role.name) {
      return res.status(400).json({ success: false, message: "System role name cannot be changed" });
    }

    role.name = nextName;
    role.description = parsed.data.description || "";
    role.pages = parsed.data.pages;
    await role.save();

    res.json({ success: true, message: "Role updated", data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRoleConfig = async (req, res) => {
  try {
    const role = await RoleConfig.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });
    if (role.isSystem) {
      return res.status(400).json({ success: false, message: "System role cannot be deleted" });
    }
    await role.deleteOne();
    res.json({ success: true, message: "Role deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
