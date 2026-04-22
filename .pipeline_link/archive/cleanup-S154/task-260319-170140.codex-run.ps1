$prompt = Get-Content -Raw 'C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/task-260319-170140.codex-prompt.txt'
codex exec -C 'C:/Dev/menuapp-code-review' --full-auto $prompt *> 'C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/task-260319-170140.log'
