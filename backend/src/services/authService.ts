import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

import { prisma } from './prisma.js';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui-2026';
  private jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  /**
   * Hash de password
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Comparar password com hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Gerar JWT token
   */
  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as any);
  }

  /**
   * Verificar JWT token
   */
  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Login - buscar usuário e validar password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Validar password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Password inválido');
    }

    // Gerar token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Remover password do response
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword as User,
    };
  }

  /**
   * Register - criar novo usuário
   */
  async register(
    email: string,
    password: string,
    name: string,
    role: 'ADMIN' | 'LAWYER' | 'STAFF' = 'STAFF'
  ): Promise<LoginResponse> {
    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    // Gerar token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Remover password do response
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword as User,
    };
  }

  /**
   * Buscar usuário por ID
   */
  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    // Remover password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const updateData: any = { ...data };

    // Se password for fornecido, fazer hash
    if (data.password) {
      updateData.password = await this.hashPassword(data.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (!user) {
      return null;
    }

    // Remover password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
}

export const authService = new AuthService();
