import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Category } from '../../services/categories/categories.model';
import { CategoriesService } from '../../services/categories/categories.service';

@Component({
  selector: 'is-category-navigation',
  templateUrl: './category-navigation.component.html'
})

export class CategoryNavigationComponent implements OnInit {
  @Input() category: Category;
  topLevelCategory: Category;
  currentCategoryUri: string;

  constructor(private categoriesService: CategoriesService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe((data: { category: Category }) => {
      this.category = data.category;
      this.currentCategoryUri = this.route.snapshot.url.map(x => x.path).join('/');
      this.categoriesService.getCategory(this.route.snapshot.url[0].toString()).subscribe((categoryData: Category) => {
        this.topLevelCategory = categoryData;
      });
    });
  }
}

