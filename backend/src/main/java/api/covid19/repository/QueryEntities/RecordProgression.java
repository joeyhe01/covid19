package api.covid19.repository.QueryEntities;

public interface RecordProgression {
    public Integer getDailyActiveGrowth();
    public Integer getDailyRecoveredGrowth();
    public Integer getDailyConfirmedGrowth();
    public Integer getDailyDeathGrowth();

}
