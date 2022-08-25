import {Controller, Get, HttpException, Inject, Query} from '@nestjs/common';
import {SECONDS_HOUR_MILLISEC} from '../../utils/enum.utils';
import {GREEN} from '../../utils/icons.utils';
import {ClientService} from '../../client/service/client.service';
import {ExtensionService} from '../service/extension.service';

@Controller('ext')
export class ExtensionController {
  constructor(
    @Inject(ExtensionService)
    private readonly sitesService: ExtensionService,
    @Inject(ClientService)
    private readonly clientService: ClientService,
  ) {}

  @Get('')
  async getSiteStatus(@Query('origin') origin: string) {
    if (
      !origin.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
      origin.length > 253
    ) {
      throw new HttpException('Bad Request', 400);
    }
    const site = await this.sitesService.getSite(origin);

    if (site) {
      return this.sitesService.updateSite(site, SECONDS_HOUR_MILLISEC, `./icons/${GREEN}.png`);
    }

    const newSite = await this.sitesService.createSite(origin);
  }
}
