// Keep the original prospect order within each stage; unknown stages are not displayed.
export function groupProspectsByStage(prospects, stages) {
  const groups = new Map(stages.map(({id}) => [id, []]));
  for (const prospect of prospects) {
    const group = groups.get(prospect.stage);
    if (group) group.push(prospect);
  }
  return groups;
}
