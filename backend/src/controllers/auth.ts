import { Request, Response } from 'express';
import { authService } from '../services/authService.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * POST /auth/login
 * Login de usuário
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e password são obrigatórios',
      });
    }

    const result = await authService.login(email, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({
      error: error.message || 'Erro ao fazer login',
    });
  }
}

/**
 * POST /auth/register
 * Registro de novo usuário
 */
export async function register(req: Request, res: Response) {
  try {
    const { email, password, name, role, inviteCode } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password e name são obrigatórios',
      });
    }

    // Código de convite: só é exigido se estiver configurado no servidor
    // (variável de ambiente SIGNUP_INVITE_CODE). Sem ele, o cadastro fica aberto.
    const requiredInviteCode = (process.env.SIGNUP_INVITE_CODE || '').trim();
    if (requiredInviteCode && (inviteCode || '').trim() !== requiredInviteCode) {
      return res.status(403).json({
        error: 'Código de convite inválido. Peça o código ao administrador do escritório.',
      });
    }

    const result = await authService.register(
      email,
      password,
      name,
      role || 'STAFF'
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(400).json({
      error: error.message || 'Erro ao registrar usuário',
    });
  }
}

/**
 * GET /auth/me
 * Obter usuário autenticado
 */
export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: 'Não autenticado',
      });
    }

    const user = await authService.getUserById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao buscar usuário',
    });
  }
}

/**
 * PUT /auth/profile
 * Atualizar perfil do usuário
 */
export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: 'Não autenticado',
      });
    }

    const { name, phone, avatar } = req.body;

    const user = await authService.updateUser(req.userId, {
      name,
      phone,
      avatar,
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao atualizar perfil',
    });
  }
}

/**
 * POST /auth/logout
 * Logout de usuário (apenas para confirmar no frontend)
 */
export async function logout(_req: Request, res: Response) {
  try {
    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao fazer logout',
    });
  }
}
