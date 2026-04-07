import { Component, Input, OnInit } from "@angular/core";
import { ItemsApiService } from "src/app/items-api.service";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-chart-analysis-block",
  templateUrl: "./chart-analysis-block.component.html",
  styleUrls: ["./chart-analysis-block.component.css"]
})
export class ChartAnalysisBlockComponent implements OnInit {

  @Input() params: { projectName: string, scenarioName: string, id: string };
  @Input() chartType: string;
  @Input() chartData: any;

  analysis = "";
  generated = false;
  loading = false;
  editing = false;
  saving = false;

  constructor(private itemsApiService: ItemsApiService) {}

  ngOnInit(): void {
    this.itemsApiService
      .fetchChartAnalysis(this.params.projectName, this.params.scenarioName, this.params.id, this.chartType)
      .pipe(catchError(() => of({ analysis: null, generated: false })))
      .subscribe(result => {
        this.analysis = result.analysis || "";
        this.generated = result.generated;
      });
  }

  suggestWithAi(): void {
    this.loading = true;
    const body = {
      chartType: this.chartType,
      chartData: this.chartData,
    };
    this.itemsApiService
      .upsertChartAnalysis(
        this.params.projectName,
        this.params.scenarioName,
        this.params.id,
        this.chartType,
        JSON.stringify(body)
      )
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        this.loading = false;
        if (res) {
          this.itemsApiService
            .fetchChartAnalysis(this.params.projectName, this.params.scenarioName, this.params.id, this.chartType)
            .pipe(catchError(() => of({ analysis: null, generated: false })))
            .subscribe(result => {
              this.analysis = result.analysis || "";
              this.generated = result.generated;
            });
        }
      });
  }

  startEditing(): void {
    this.editing = true;
  }

  saveAnalysis(): void {
    this.saving = true;
    this.itemsApiService
      .upsertChartAnalysis(
        this.params.projectName,
        this.params.scenarioName,
        this.params.id,
        this.chartType,
        this.analysis
      )
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.saving = false;
        this.editing = false;
      });
  }

  cancelEditing(): void {
    this.editing = false;
  }
}
