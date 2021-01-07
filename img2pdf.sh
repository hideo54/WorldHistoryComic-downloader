for dir in `ls -d dist/*/`; do
    dir=${dir%/}
    convert ${dir}/*.jpg ${dir}.pdf
    echo "Finish creating ${dir} book."
done