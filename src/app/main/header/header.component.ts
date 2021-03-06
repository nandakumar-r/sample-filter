import { Component, OnInit } from '@angular/core';

import { UserService } from '@app/shared-components/user.service';
import { User } from '@app/shared-components/user';
import { SearchService } from '@app/core/services/search.service';
import { SearchParam } from '@app/core/models/search-param.model';
import { SearchInput } from '@app/core/models/search-input.model';
import { DefaultLanguage, DefaultClientId, DefaultContentType } from 'src/constants';

@Component({
  selector: 'main-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {

  user:User
  clientId: number;
  searchString: string;
  selectedLangCode: string;
  contentType: string;
  isLoaded: boolean = false;
  loading = false;

  constructor(
    public userService: UserService,
    private searchService: SearchService
  ) { }

  async ngOnInit() {
    this.subscribeToReload();
    this.subscribeToChangeInClientId();
    this.subscribeToLanguageChange();
    this.subscribeToChangeInContentType();
    this.user = await this.userService.me();
  }

  /**
   * @author Sijo Kuriakose
   * @description client id subscription
   */
  subscribeToChangeInClientId() {
    this.searchService.getClientId().subscribe(clientId => {
      if (clientId) {
        this.clientId = clientId;
        this.onSearch(this.searchString);
      }
    })
  }

  /**
   * @author Sijo Kuriakose
   * @description reload subscription
   */
  subscribeToReload() {
    this.searchService.getReload().subscribe(data => {
      if (data) {
        this.onSearch(this.searchString);
      }
    })
  }

  onUserChangedClient (newClient:number) {
    // TODO #codereview This smells bad.
    // Oughtn't I be able to write this as this.UserService.preferences.language = newLanguage?
    this.userService.preferences.lastClientId = newClient;
    this.userService.preferences = this.userService.preferences;
  }

  onUserChangedLanguage (newLanguage:string) {
    // TODO #codereview This smells bad.
    // Oughtn't I be able to write this as this.userService.preferences.language = newLanguage?
    this.userService.preferences.language = newLanguage;
    this.userService.preferences = this.userService.preferences;
  }

  /**
   * @author Sijo Kuriakose
   * @description search api function
   */
  onSearch (searchString) {
    this.loading = true;
    this.searchString = searchString;
    const requestBody: SearchInput = {
      clientId: this.clientId ? this.clientId : DefaultClientId,
      language: this.selectedLangCode ? this.selectedLangCode : DefaultLanguage,
      text: searchString,
      contentType: this.contentType ? this.contentType : DefaultContentType
    };
    const params: SearchParam = {
      extended: true
    };
    this.searchService.classifyText(requestBody, params).subscribe(data => {
      this.searchService.storeApiResponse(data);
      this.loading = false;
    })
  }

  /**
   * @author Sijo Kuriakose
   * @description language change subscription
   */
  subscribeToLanguageChange() {
    this.searchService.getLanguage().subscribe(langCode =>{
      if (langCode) {
        this.selectedLangCode = langCode;
        this.onSearch(this.searchString);
      }
    })
  }

  /**
   * @author Sijo Kuriakose
   * @description content type change subscription
   */
  subscribeToChangeInContentType() {
    this.searchService.getContentType().subscribe(contentType => {
      if (contentType) {
        this.contentType = contentType;
        this.onSearch(this.searchString);
      }
    });
  }

}
