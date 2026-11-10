/** Pure CRM pipeline aggregation. Stage ordering and monetary coercion match the existing page. */
export function getCrmPipelineValue(prospects, stages) {
  return stages.reduce((acc, stage) => {
    acc[stage.id] = prospects
      .filter((item) => item.stage === stage.id)
      .reduce((sum, item) => sum + Number(item.estimatedValue || 0), 0);
    return acc;
  }, {});
}
