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
    // Extract hostname (e.g., "abc.taleschool.taldev.xyz" or "localhost" or "31.97.190.200")
    const hostname = req.hostname;

    // Base domain for production
    const baseDomain = 'taleschool.taldev.xyz';
    const apiDomain = 'api-taleschool.taldev.xyz';

    let subdomain: string | null = null;

    // Check if hostname is an IP address (skip tenant resolution)
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':');

    // Check if it's localhost
    const isLocalhost = hostname === 'localhost' || hostname.startsWith('127.0.0.1');

    if (isIpAddress || isLocalhost) {
      // IP address or localhost - no subdomain (main domain/Super Admin)
      req.school = null;
      req.schoolId = null;
      return next();
    }

    // Check if hostname matches base domain or API domain exactly (no subdomain)
    if (hostname === baseDomain || hostname === apiDomain) {
      req.school = null;
      req.schoolId = null;
      return next();
    }

    // Check if hostname is a subdomain of base domain
    if (hostname.endsWith(`.${baseDomain}`)) {
      // Extract subdomain (everything before the base domain)
      subdomain = hostname.substring(0, hostname.length - baseDomain.length - 1);
      
      // If subdomain contains dots, take only the first part (e.g., "abc" from "abc.subdomain")
      if (subdomain.includes('.')) {
        subdomain = subdomain.split('.')[0];
      }
    }

    // If no subdomain, this is the main domain (Super Admin area)
    if (!subdomain) {
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
