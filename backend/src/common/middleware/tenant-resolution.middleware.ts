import { Injectable, NestMiddleware, NotFoundException, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { SchoolContext } from '../interfaces/school.interface';

// Extend Express Request to include school and schoolId
declare global {
  namespace Express {
    interface Request {
      school?: SchoolContext;
      schoolId?: string;
    }
  }
}

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract hostname (e.g., "abc.xyz.com" or "localhost:3000")
    const hostname = req.hostname;

    // Split by dots
    const parts = hostname.split('.');

    // Check if it's a subdomain request
    // For local development: localhost (no subdomain) or subdomain.localhost
    // For production: xyz.com (no subdomain) or subdomain.xyz.com
    
    let subdomain: string | null = null;

    if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
      // Local development - no subdomain (main domain)
      subdomain = null;
    } else if (parts.length >= 2 && parts[0] !== 'www') {
      // Extract subdomain (first part)
      subdomain = parts[0];
    }

    // If no subdomain, this is the main domain (Super Admin area)
    if (!subdomain) {
      // Super Admin domain - no school context needed
      req.school = null;
      req.schoolId = null;
      return next();
    }

    // Lookup school by slug (subdomain)
    try {
      const school = await this.prisma.school.findUnique({
        where: { slug: subdomain },
      });

      if (!school) {
        throw new NotFoundException(`School with subdomain "${subdomain}" not found`);
      }

      if (!school.isActive) {
        throw new BadRequestException(`School "${subdomain}" is currently inactive`);
      }

      // Attach school context to request
      req.school = {
        id: school.id,
        name: school.name,
        slug: school.slug,
        isActive: school.isActive,
      };
      req.schoolId = school.id;

      next();
    } catch (error) {
      throw error;
    }
  }
}
