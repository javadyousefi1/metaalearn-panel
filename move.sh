rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='.turbo' \
    --exclude='.next' \
    /Users/javadyousefi/me/projects/metaalearn-panel \
    root@185.79.97.146:/root/projects
