import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import UsuarioService from '../services/Usuario';
import { AuthRequest } from '../middleware/auth';

const createUsuario = async (req: Request, res: Response, next: NextFunction) => {
   
    try {
        const savedUsuario = await UsuarioService.createUsuario(req.body);
        return res.status(201).json(savedUsuario);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'El email ya está registrado' });
        }
        return res.status(500).json({ error });
    }
};

const readUsuario = async (req: Request, res: Response, next: NextFunction) => {
    const usuarioId = req.params.usuarioId;

    try {
        const usuario = await UsuarioService.getUsuario(usuarioId);
        return usuario ? res.status(200).json(usuario) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usuarios = await UsuarioService.getAllUsuarios();
        return res.status(200).json(usuarios);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateUsuario = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const usuarioId = req.params.usuarioId;

    const isAdmin = req.user?.role === 'admin';
    const isSelf = req.user?.id === usuarioId;

    // Solo admin o el propio usuario
    if (!isAdmin && !isSelf) {
        return res.status(403).json({ message: 'No tienes permiso para actualizar a otro usuario' });
    }

    try {
        const updatedUsuario = await UsuarioService.updateUsuario(usuarioId, req.body);
        return updatedUsuario ? res.status(201).json(updatedUsuario) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};


const deleteUsuario = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const usuarioId = req.params.usuarioId;

    const isAdmin = req.user?.role === 'admin';
    const isSelf = req.user?.id === usuarioId;

    // Solo admin o el propio usuario
    if (!isAdmin && !isSelf) {
        return res.status(403).json({ message: 'No tienes permiso para borrar a otro usuario' });
    }

    try {
        const usuario = await UsuarioService.deleteUsuario(usuarioId);
        return usuario ? res.status(201).json(usuario) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const adminResource = async (req: AuthRequest, res: Response) => {
    return res.status(200).json({
        message: 'Recurso crítico solo para administradores',
        usuario: {
            id: req.user?.id,
            email: req.user?.email,
            role: req.user?.role
        }
    });
};

export default { createUsuario, readUsuario, readAll, updateUsuario, deleteUsuario, adminResource };
